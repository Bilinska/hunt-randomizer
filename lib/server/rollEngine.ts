import { generateOverlayLoadout } from "../randomizer";
import { effectiveWeaponCapacity, weaponWeight } from "../rules";
import { hunterNameForRoll } from "../hunterNames";
import type { OverlaySettings, RollEvent } from "../types";
import { readSettings } from "./store";
import { broadcastOverlayEvent } from "./overlayHub";

let lastRollAt = 0;
let rollNumber = 0;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

export type RollSource = RollEvent["source"];

export interface RollRequest {
  source: RollSource;
  roller: string;
  /** mods/broadcaster bypass cooldown; subs may use the "reroll" alias but still respect it */
  bypassCooldown: boolean;
}

export function secondsSinceLastRoll(): number {
  if (lastRollAt === 0) return Infinity;
  return (Date.now() - lastRollAt) / 1000;
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

  rollNumber += 1;
  lastRollAt = Date.now();

  const event: RollEvent = {
    type: "roll",
    loadout,
    weaponCapacity: capacity,
    weaponWeightUsed: weightUsed,
    hunterName: hunterNameForRoll(rollNumber),
    roller: request.roller,
    source: request.source,
    rollNumber,
    ts: lastRollAt,
    hideDelaySec: settings.hideDelaySec
  };

  broadcastOverlayEvent(event);

  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    broadcastOverlayEvent({ type: "idle" });
  }, settings.hideDelaySec * 1000);

  return event;
}
