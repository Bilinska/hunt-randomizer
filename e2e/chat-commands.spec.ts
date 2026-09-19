import { test, expect } from "@playwright/test";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";

// Feeds EventSub-shaped notifications straight into the server's handler, so
// the chat command rules can be checked without a browser or a Twitch account.
// Runs in the test process against a scratch data dir (never the real .data/).

type Hub = typeof import("../lib/server/overlayHub");
type EventSub = typeof import("../lib/server/twitchEventSub");
type Store = typeof import("../lib/server/store");
type RollEngine = typeof import("../lib/server/rollEngine");

let hub: Hub;
let eventSub: EventSub;
let rollEngine: RollEngine;

const REWARD_ID = "reward-1";

test.beforeAll(async () => {
  process.env.BAYOU_DATA_DIR = mkdtempSync(path.join(tmpdir(), "bayou-chat-"));
  const store: Store = await import("../lib/server/store");
  hub = await import("../lib/server/overlayHub");
  eventSub = await import("../lib/server/twitchEventSub");
  rollEngine = await import("../lib/server/rollEngine");
  store.writeSettings({
    ...store.readSettings(),
    cooldownSec: 90,
    hideDelaySec: 600,
    rewardId: REWARD_ID
  });
});

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== "chromium", "server logic, no browser involved");
  const g = globalThis as unknown as {
    __bayouRollState?: {
      lastRollAt: number;
      lastReplayAt: number;
      rollNumber: number;
      hideTimer: ReturnType<typeof setTimeout> | null;
      history: unknown[];
    };
  };
  const s = g.__bayouRollState!;
  if (s.hideTimer) clearTimeout(s.hideTimer);
  s.lastRollAt = 0;
  s.lastReplayAt = 0;
  s.rollNumber = 0;
  s.hideTimer = null;
  s.history = [];
  hub.broadcastOverlayEvent({ type: "idle" });
});

test.afterAll(() => {
  const g = globalThis as unknown as { __bayouRollState?: { hideTimer: ReturnType<typeof setTimeout> | null } };
  if (g.__bayouRollState?.hideTimer) clearTimeout(g.__bayouRollState.hideTimer);
});

function chat(login: string, text: string, badges: string[] = []) {
  eventSub.handleMessage(
    JSON.stringify({
      metadata: { message_type: "notification" },
      payload: {
        subscription: { type: "channel.chat.message" },
        event: {
          chatter_user_id: "1",
          chatter_user_login: login,
          chatter_user_name: login,
          message: { text },
          badges: badges.map((b) => ({ set_id: b, id: "1" }))
        }
      }
    })
  );
}

function redeem(login: string, rewardId: string) {
  eventSub.handleMessage(
    JSON.stringify({
      metadata: { message_type: "notification" },
      payload: {
        subscription: { type: "channel.channel_points_custom_reward_redemption.add" },
        event: {
          user_id: "2",
          user_login: login,
          user_name: login,
          reward: { id: rewardId, title: "t" }
        }
      }
    })
  );
}

function shown() {
  const e = hub.getLastOverlayEvent();
  return e.type === "roll"
    ? { type: e.type, n: e.rollNumber, source: e.source, replay: e.replay === true, roller: e.roller }
    : { type: e.type };
}

test.describe("chat commands", () => {
  test("a viewer's !loadout rolls, a second one inside the cooldown is ignored", () => {
    chat("alice", "!loadout");
    expect(shown()).toMatchObject({ type: "roll", n: 1, source: "chat", roller: "alice" });

    chat("bob", "!loadout");
    expect(shown()).toMatchObject({ n: 1 });
  });

  test("a redemption of the configured reward rolls even during the cooldown", () => {
    chat("alice", "!loadout");
    redeem("bob", "some-other-reward");
    expect(shown()).toMatchObject({ n: 1, source: "chat" });

    redeem("bob", REWARD_ID);
    expect(shown()).toMatchObject({ n: 2, source: "channel-points", roller: "bob" });
  });

  test("!loadout prev with nothing rolled yet does nothing", () => {
    chat("alice", "!loadout prev");
    expect(shown()).toEqual({ type: "idle" });
  });

  test("!loadout prev on an idle overlay shows the latest roll again", () => {
    chat("alice", "!loadout");
    hub.broadcastOverlayEvent({ type: "idle" });

    chat("bob", "!loadout prev");
    expect(shown()).toMatchObject({ type: "roll", n: 1, replay: true, roller: "alice" });
  });

  test("!loadout prev steps back from the roll on screen, repeatedly, and stops at the oldest", () => {
    chat("mod", "!loadout", ["moderator"]);
    chat("mod", "!loadout", ["moderator"]);
    chat("mod", "!loadout", ["moderator"]);
    expect(shown()).toMatchObject({ n: 3, replay: false });

    chat("mod", "!loadout prev", ["moderator"]);
    expect(shown()).toMatchObject({ n: 2, replay: true });

    chat("mod", "!loadout prev", ["moderator"]);
    expect(shown()).toMatchObject({ n: 1, replay: true });

    // Already at the oldest: nothing earlier, the card stays as it is.
    chat("mod", "!loadout prev", ["moderator"]);
    expect(shown()).toMatchObject({ n: 1, replay: true });
  });

  test("a replay does not create a roll or start the roll cooldown", () => {
    chat("mod", "!loadout", ["moderator"]);
    chat("mod", "!loadout", ["moderator"]);
    hub.broadcastOverlayEvent({ type: "idle" });

    chat("mod", "!loadout prev", ["moderator"]);
    chat("alice", "!loadout"); // still inside the roll cooldown of the last real roll
    expect(shown()).toMatchObject({ n: 2, replay: true }); // not rolled: cooldown from real roll #2

    // A new real roll numbers from the last real one, not from the replay.
    chat("mod", "!loadout", ["moderator"]);
    expect(shown()).toMatchObject({ n: 3, replay: false });
  });

  test("viewers share a replay cooldown, moderators and the broadcaster skip it", () => {
    chat("mod", "!loadout", ["moderator"]);
    chat("mod", "!loadout", ["moderator"]);
    hub.broadcastOverlayEvent({ type: "idle" });

    chat("alice", "!loadout prev"); // idle -> latest (#2)
    expect(shown()).toMatchObject({ n: 2, replay: true });

    chat("bob", "!loadout prev"); // inside the replay cooldown
    expect(shown()).toMatchObject({ n: 2, replay: true });

    chat("streamer", "!loadout prev", ["broadcaster"]); // bypasses it, steps back
    expect(shown()).toMatchObject({ n: 1, replay: true });
  });

  test("history keeps only the last 10 rolls", () => {
    for (let i = 0; i < 12; i++) chat("mod", "!loadout", ["moderator"]);
    expect(shown()).toMatchObject({ n: 12 });

    for (let i = 0; i < 9; i++) chat("mod", "!loadout prev", ["moderator"]);
    expect(shown()).toMatchObject({ n: 3, replay: true }); // #12 back to #3

    chat("mod", "!loadout prev", ["moderator"]); // #2 is no longer kept
    expect(shown()).toMatchObject({ n: 3, replay: true });
  });

  test("history and roll numbering survive a restart", () => {
    chat("mod", "!loadout", ["moderator"]);
    chat("mod", "!loadout", ["moderator"]);

    // Simulate a restart: memory is gone, only the file on disk remains.
    const g = globalThis as unknown as {
      __bayouRollState: { history: unknown[]; rollNumber: number; lastReplayAt: number };
    };
    g.__bayouRollState.history = [];
    g.__bayouRollState.rollNumber = 0;
    hub.broadcastOverlayEvent({ type: "idle" });
    rollEngine.restoreRollHistory();

    chat("alice", "!loadout prev"); // idle -> latest saved roll
    expect(shown()).toMatchObject({ n: 2, replay: true, roller: "mod" });

    chat("mod", "!loadout prev", ["moderator"]); // and one further back
    expect(shown()).toMatchObject({ n: 1, replay: true });

    // Numbering continues from the saved rolls instead of restarting at #1.
    chat("mod", "!loadout", ["moderator"]);
    expect(shown()).toMatchObject({ n: 3, replay: false });
  });

  test("a corrupt history file starts empty instead of failing", () => {
    writeFileSync(path.join(process.env.BAYOU_DATA_DIR!, "roll-history.json"), "{ not json");
    rollEngine.restoreRollHistory();

    chat("mod", "!loadout prev", ["moderator"]);
    expect(shown()).toEqual({ type: "idle" });

    chat("mod", "!loadout", ["moderator"]);
    expect(shown()).toMatchObject({ n: 1, replay: false });
  });
});
