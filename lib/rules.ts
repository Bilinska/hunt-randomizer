import type { Loadout, RandomizerSettings, Trait, Weapon, WeaponSize } from "./types";

// Вага слота за системою розмірів зброї (1896). Уточнюйте після кожного патчу.
const SLOT_WEIGHT: Record<WeaponSize, number> = {
  small: 1,
  medium: 2,
  big: 3
};

// Загальна місткість зброярні хантера в одиницях ваги.
export const MAX_WEAPON_CAPACITY = 5;

// Трейт Quartermaster відкриває додатковий слот (напр. large + large).
export const QUARTERMASTER_BONUS_SLOTS = 1;

export function effectiveWeaponCapacity(traits: Trait[]): number {
  const hasQuartermaster = traits.some((t) => t.id === "quartermaster");
  return MAX_WEAPON_CAPACITY + (hasQuartermaster ? QUARTERMASTER_BONUS_SLOTS : 0);
}

// Спрощена шкала очок трейтів. TODO: замінити на реальну прогресію за bloodline-рангом.
export function getMaxTraitPoints(rank: number): number {
  if (rank < 10) return 8;
  if (rank < 25) return 14;
  if (rank < 50) return 20;
  return 26;
}

export function getMaxScarceItems(): number {
  return 2;
}

export function weaponWeight(size: WeaponSize): number {
  return SLOT_WEIGHT[size];
}

export function validateWeaponSlots(weapons: (Weapon | null)[]): boolean {
  const totalWeight = weapons.reduce(
    (sum, w) => sum + (w ? weaponWeight(w.size) : 0),
    0
  );
  return totalWeight <= MAX_WEAPON_CAPACITY;
}

export function validateTraitPoints(
  totalTraitPoints: number,
  rank: number
): boolean {
  return totalTraitPoints <= getMaxTraitPoints(rank);
}

export function validateScarceLimit(loadout: Loadout): boolean {
  const scarceWeapons = loadout.weapons.filter((w) => w?.scarce).length;
  const scarceTools = loadout.tools.filter((t) => t?.scarce).length;
  const scarceConsumables = loadout.consumables.filter(
    (c) => c?.scarce
  ).length;
  return (
    scarceWeapons + scarceTools + scarceConsumables <= getMaxScarceItems()
  );
}

export function validatePriceLimit(
  loadout: Loadout,
  settings: RandomizerSettings
): boolean {
  if (settings.priceLimit === null) return true;
  return loadout.totalPrice <= settings.priceLimit;
}

export function isLoadoutValid(
  loadout: Loadout,
  settings: RandomizerSettings
): boolean {
  return (
    validateWeaponSlots(loadout.weapons) &&
    validateTraitPoints(loadout.totalTraitPoints, settings.rank) &&
    validateScarceLimit(loadout) &&
    validatePriceLimit(loadout, settings)
  );
}
