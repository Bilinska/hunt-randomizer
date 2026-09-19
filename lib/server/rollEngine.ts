import { generateOverlayLoadout } from "../randomizer";
import { effectiveWeaponCapacity, weaponWeight } from "../rules";
import { hunterNameForRoll } from "../hunterNames";
import type { OverlaySettings, RollEvent } from "../types";
import { readSettings } from "./store";
import { broadcastOverlayEvent } from "./overlayHub";

// server.ts (tsx) and the Next-bundled API routes each get their own copy of
// this module, so plain module-level variables would give chat rolls and manual
// rolls separate counters, cooldowns and hide timers. Keep the state on
// globalThis, same as overlayHub.
interface RollState {
  lastRollAt: number;
  rollNumber: number;
  hideTimer: ReturnType<typeof setTimeout> | null;
}

const g = globalThis as unknown as { __bayouRollState?: RollState };
if (!g.__bayouRollState) {
  g.__bayouRollState = { lastRollAt: 0, rollNumber: 0, hideTimer: null };
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

  broadcastOverlayEvent(event);

  if (state.hideTimer) clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    broadcastOverlayEvent({ type: "idle" });
  }, settings.hideDelaySec * 1000);

  return event;
}
