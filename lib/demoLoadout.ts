import { generateOverlayLoadout } from "./randomizer";
import { effectiveWeaponCapacity, weaponWeight } from "./rules";
import { hunterNameForRoll } from "./hunterNames";
import type { OverlaySettings, RollEvent } from "./types";

const DEMO_SETTINGS: OverlaySettings = {
  channel: "your_channel",
  chatCommand: "!loadout",
  cooldownSec: 90,
  hideDelaySec: 25,
  traitPointCap: 8,
  maxTools: 4,
  maxConsumables: 4,
  bannedItemIds: [],
  rewardId: null,
  rewardTitle: null,
  layout: "dossier"
};

/** Client-side sample roll for the "Preview" / `?demo=1` overlay links — no server needed. */
export function buildDemoRollEvent(): RollEvent {
  const loadout = generateOverlayLoadout(DEMO_SETTINGS);
  const capacity = effectiveWeaponCapacity(loadout.traits);
  const weaponWeightUsed = loadout.weapons.reduce(
    (sum, w) => sum + (w ? weaponWeight(w.size) : 0),
    0
  );

  const rollNumber = Math.floor(1000 + Math.random() * 9000);

  return {
    type: "roll",
    loadout,
    weaponCapacity: capacity,
    weaponWeightUsed,
    hunterName: hunterNameForRoll(rollNumber),
    roller: "preview",
    source: "manual",
    rollNumber,
    ts: Date.now(),
    hideDelaySec: DEMO_SETTINGS.hideDelaySec
  };
}
