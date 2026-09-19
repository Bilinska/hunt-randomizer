// Twitch EventSub over WebSocket — chat commands + channel-point redemptions.
// Docs: https://dev.twitch.tv/docs/eventsub/handling-websocket-events/
//
// NOTE: this talks to the live Twitch API and hasn't been exercised against a
// real broadcaster token from this sandbox — the subscription types/versions
// below match Twitch's documented EventSub WebSocket reference as of this
// writing. If Twitch rejects a subscription, check the response body logged
// to the console first; the shapes here are the most likely thing to drift.
import WebSocket from "ws";
import { getValidToken, currentClientId } from "./twitchAuth";
import { readSettings } from "./store";
import { roll } from "./rollEngine";

const EVENTSUB_WS_URL = "wss://eventsub.wss.twitch.tv/ws";
const EVENTSUB_SUBSCRIPTIONS_URL = "https://api.twitch.tv/helix/eventsub/subscriptions";

type Badge = { set_id: string; id: string };

interface ChatMessageEvent {
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message: { text: string };
  badges: Badge[];
}

interface RedemptionEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  reward: { id: string; title: string };
}

// server.ts (tsx) and the Next-bundled API routes each get their own copy of
// this module, so plain module-level variables would give /api/twitch/status a
// socket that is always null while the real one lives in server.ts. Keep the
// connection state on globalThis, same as overlayHub.
interface EventSubState {
  socket: WebSocket | null;
  sessionId: string | null;
  reconnecting: boolean;
  statusListeners: ((connected: boolean) => void)[];
}

const g = globalThis as unknown as { __bayouEventSub?: EventSubState };
if (!g.__bayouEventSub) {
  g.__bayouEventSub = { socket: null, sessionId: null, reconnecting: false, statusListeners: [] };
}
const es = g.__bayouEventSub;

export function onEventSubStatusChange(listener: (connected: boolean) => void) {
  es.statusListeners.push(listener);
}

function notifyStatus(connected: boolean) {
  for (const l of es.statusListeners) l(connected);
}

function hasBadge(badges: Badge[] | undefined, setId: string): boolean {
  return Boolean(badges?.some((b) => b.set_id === setId));
}

async function subscribe(
  type: string,
  version: string,
  condition: Record<string, string>,
  accessToken: string,
  broadcasterId: string
) {
  const res = await fetch(EVENTSUB_SUBSCRIPTIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": currentClientId(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type,
      version,
      condition,
      transport: { method: "websocket", session_id: es.sessionId }
    })
  });

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error(
      `[twitch] failed to subscribe to ${type} for broadcaster ${broadcasterId}: ${res.status} ${await res.text()}`
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(`[twitch] subscribed to ${type}`);
  }
}

async function subscribeAll(accessToken: string, userId: string) {
  await subscribe(
    "channel.chat.message",
    "1",
    { broadcaster_user_id: userId, user_id: userId },
    accessToken,
    userId
  );
  await subscribe(
    "channel.channel_points_custom_reward_redemption.add",
    "1",
    { broadcaster_user_id: userId },
    accessToken,
    userId
  );
}

function parseCommand(
  text: string,
  chatCommand: string
): { isBase: boolean; isReroll: boolean } {
  const normalized = text.trim().toLowerCase();
  const base = chatCommand.trim().toLowerCase();
  return {
    isBase: normalized === base,
    isReroll: normalized === `${base} reroll`
  };
}

async function handleChatMessage(event: ChatMessageEvent) {
  const settings = readSettings();
  const { isBase, isReroll } = parseCommand(event.message.text, settings.chatCommand);
  if (!isBase && !isReroll) return;
  // eslint-disable-next-line no-console
  console.log(
    `[twitch] ${isReroll ? "reroll" : "command"} from ${event.chatter_user_login}`
  );

  const isPrivileged =
    hasBadge(event.badges, "broadcaster") ||
    hasBadge(event.badges, "moderator") ||
    (isReroll && hasBadge(event.badges, "subscriber"));

  if (isReroll && !isPrivileged) return; // "reroll" alias is mods/subs/broadcaster only

  const rolled = roll({
    source: isReroll ? "reroll" : "chat",
    roller: event.chatter_user_name || event.chatter_user_login,
    bypassCooldown: hasBadge(event.badges, "broadcaster") || hasBadge(event.badges, "moderator")
  });
  if (!rolled) {
    // eslint-disable-next-line no-console
    console.log("[twitch] roll skipped (cooldown)");
  }
}

function handleRedemption(event: RedemptionEvent) {
  const settings = readSettings();
  if (!settings.rewardId || event.reward.id !== settings.rewardId) return;

  // The viewer has already spent their points, so a cooldown left over from
  // someone's !loadout must not swallow the redemption.
  roll({
    source: "channel-points",
    roller: event.user_name || event.user_login,
    bypassCooldown: true
  });
}

// Exported so the event handling can be exercised without a live Twitch socket.
export function handleMessage(raw: string) {
  const parsed = JSON.parse(raw) as {
    metadata: { message_type: string };
    payload: any;
  };

  switch (parsed.metadata.message_type) {
    case "session_welcome": {
      es.sessionId = parsed.payload.session.id;
      // eslint-disable-next-line no-console
      console.log("[twitch] eventsub session ready");
      void bootstrapSubscriptions();
      notifyStatus(true);
      break;
    }
    case "session_reconnect": {
      const reconnectUrl = parsed.payload.session.reconnect_url as string;
      reconnectTo(reconnectUrl);
      break;
    }
    case "notification": {
      const subType = parsed.payload.subscription.type as string;
      if (subType === "channel.chat.message") {
        void handleChatMessage(parsed.payload.event as ChatMessageEvent);
      } else if (subType === "channel.channel_points_custom_reward_redemption.add") {
        handleRedemption(parsed.payload.event as RedemptionEvent);
      }
      break;
    }
    case "revocation": {
      // eslint-disable-next-line no-console
      console.warn("[twitch] subscription revoked:", parsed.payload.subscription);
      break;
    }
    default:
      break;
  }
}

async function bootstrapSubscriptions() {
  const token = await getValidToken();
  if (!token) return;
  await subscribeAll(token.accessToken, token.userId);
}

function connect(url: string) {
  const ws = new WebSocket(url);
  es.socket = ws;

  ws.on("message", (data) => handleMessage(data.toString()));
  ws.on("close", () => {
    // A socket that was replaced (reconnect) or stopped on purpose has already
    // been swapped out of `socket` — only an unexpected drop of the current one
    // should notify and retry, otherwise every stop leaves an orphan behind.
    if (es.socket !== ws) return;
    notifyStatus(false);
    if (!es.reconnecting) {
      // Unexpected drop (not a graceful session_reconnect) — retry with backoff.
      setTimeout(() => void startEventSub(), 5000);
    }
  });
  ws.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[twitch] eventsub socket error:", err);
  });
}

function reconnectTo(url: string) {
  es.reconnecting = true;
  const old = es.socket;
  connect(url);
  setTimeout(() => {
    old?.close();
    es.reconnecting = false;
  }, 2000);
}

export async function startEventSub(): Promise<void> {
  const token = await getValidToken();
  if (!token) return;
  connect(EVENTSUB_WS_URL);
}

export function stopEventSub(): void {
  es.sessionId = null;
  es.socket?.close();
  es.socket = null;
  notifyStatus(false);
}

export function isEventSubConnected(): boolean {
  return es.socket?.readyState === WebSocket.OPEN;
}
