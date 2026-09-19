import { generateOverlayLoadout } from "../randomizer";
import { effectiveWeaponCapacity, weaponWeight } from "../rules";
import { hunterNameForRoll } from "../hunterNames";
import type { OverlaySettings, RollEvent } from "../types";
import { readSettings } from "./store";
import { broadcastOverlayEvent, getLastOverlayEvent } from "./overlayHub";

// server.ts (tsx) and the Next-bundled API routes each get their own copy of
// this module, so plain module-level variables would give chat rolls and manual
// rolls separate counters, cooldowns and hide timers. Keep the state on
// globalThis, same as overlayHub.
interface RollState {
  lastRollAt: number;
  lastReplayAt: number;
  rollNumber: number;
  hideTimer: ReturnType<typeof setTimeout> | null;
  history: RollEvent[];
}

// How many past rolls the "previous" command can step back through.
const HISTORY_LIMIT = 10;

const g = globalThis as unknown as { __bayouRollState?: RollState };
if (!g.__bayouRollState) {
  g.__bayouRollState = {
    lastRollAt: 0,
    lastReplayAt: 0,
    rollNumber: 0,
    hideTimer: null,
    history: []
  };
}
const state = g.__bayouRollState;

export type RollSource = RollEvent["source"];

export interface RollRequest {
  source: RollSource;
  roller: string;
  /** mods/broadcaster bypass cooldown; subs may use the "reroll" alias but still respect it */
  bypassCooldown: boolean;
}

export function secondsSinceLastRoll(): number {
  if (state.lastRollAt === 0) return Infinity;
  return (Date.now() - state.lastRollAt) / 1000;
}

export function isOnCooldown(settings: OverlaySettings): boolean {
  return secondsSinceLastRoll() < settings.cooldownSec;
}

export function roll(request: RollRequest): RollEvent | null {
  const settings = readSettings();

  if (!request.bypassCooldown && isOnCooldown(settings)) {
    return null;
  }

  const loadout = generateOverlayLoadout(settings);
  const capacity = effectiveWeaponCapacity(loadout.traits);
  const weightUsed = loadout.weapons.reduce(
    (sum, w) => sum + (w ? weaponWeight(w.size) : 0),
    0
  );

  state.rollNumber += 1;
  state.lastRollAt = Date.now();

  const event: RollEvent = {
    type: "roll",
    loadout,
    weaponCapacity: capacity,
    weaponWeightUsed: weightUsed,
    hunterName: hunterNameForRoll(state.rollNumber),
    roller: request.roller,
    source: request.source,
    rollNumber: state.rollNumber,
    ts: state.lastRollAt,
    hideDelaySec: settings.hideDelaySec
  };

  state.history.push(event);
  if (state.history.length > HISTORY_LIMIT) state.history.shift();

  present(event, settings.hideDelaySec);

  return event;
}

function present(event: RollEvent, hideDelaySec: number) {
  broadcastOverlayEvent(event);

  if (state.hideTimer) clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    broadcastOverlayEvent({ type: "idle" });
  }, hideDelaySec * 1000);
}

export interface ReplayRequest {
  /** mods/broadcaster bypass the replay cooldown */
  bypassCooldown: boolean;
}

/**
 * Shows an earlier roll again. If a roll is on screen it steps back one from
 * that one (so repeating walks further back); if the overlay is idle it shows
 * the most recent roll. Never creates a new roll or touches the roll cooldown.
 */
export function replayPrevious(request: ReplayRequest): RollEvent | null {
  const settings = readSettings();

  if (
    !request.bypassCooldown &&
    state.lastReplayAt !== 0 &&
    (Date.now() - state.lastReplayAt) / 1000 < settings.cooldownSec
  ) {
    return null;
  }

  const history = state.history;
  if (history.length === 0) return null;

  const shown = getLastOverlayEvent();
  let target: RollEvent | undefined;
  if (shown.type === "roll") {
    const idx = history.findIndex((e) => e.rollNumber === shown.rollNumber);
    target = idx > 0 ? history[idx - 1] : undefined;
  } else {
    target = history[history.length - 1];
  }
  if (!target) return null;

  state.lastReplayAt = Date.now();
  const event: RollEvent = { ...target, replay: true, hideDelaySec: settings.hideDelaySec };
  present(event, settings.hideDelaySec);
  return event;
}
