import weaponsData from "./data/weapons.json";
import toolsData from "./data/tools.json";
import consumablesData from "./data/consumables.json";
import traitsData from "./data/traits.json";
import type {
  Weapon,
  Tool,
  Consumable,
  Trait,
  Loadout,
  OverlaySettings,
  RandomizerSettings
} from "./types";
import {
  effectiveWeaponCapacity,
  getMaxTraitPoints,
  MAX_TRAITS,
  isLoadoutValid,
  weaponWeight
} from "./rules";

const WEAPONS = weaponsData as Weapon[];
const TOOLS = toolsData as Tool[];
const CONSUMABLES = consumablesData as Consumable[];
const TRAITS = traitsData as Trait[];

// Ціна дефіцитних предметів падає на 25% при активному трейті Quartermaster.
const QUARTERMASTER_DISCOUNT = 0.25;

function pickRandom<T>(pool: T[]): T | null {
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function effectivePrice(price: number, scarce: boolean, qm: boolean): number {
  if (scarce && qm) return Math.round(price * (1 - QUARTERMASTER_DISCOUNT));
  return price;
}

function availableWeapons(
  size: string,
  settings: RandomizerSettings
): Weapon[] {
  return WEAPONS.filter(
    (w) =>
      w.size === size &&
      w.minRank <= settings.rank &&
      !settings.bannedItemIds.includes(w.id)
  );
}

function availableTools(settings: RandomizerSettings): Tool[] {
  return TOOLS.filter(
    (t) => t.minRank <= settings.rank && !settings.bannedItemIds.includes(t.id)
  );
}

function availableConsumables(settings: RandomizerSettings): Consumable[] {
  return CONSUMABLES.filter(
    (c) => c.minRank <= settings.rank && !settings.bannedItemIds.includes(c.id)
  );
}

function pickTraits(settings: RandomizerSettings): Trait[] {
  const pool = TRAITS.filter(
    (t) => t.minRank <= settings.rank && !settings.bannedItemIds.includes(t.id)
  ).sort(() => Math.random() - 0.5);

  const maxPoints = getMaxTraitPoints(settings.hunterLevel);
  const picked: Trait[] = [];
  let usedPoints = 0;

  for (const trait of pool) {
    if (picked.length >= MAX_TRAITS) break;
    if (usedPoints + trait.points <= maxPoints) {
      picked.push(trait);
      usedPoints += trait.points;
    }
  }
  return picked;
}

function buildLoadout(settings: RandomizerSettings): Loadout {
  const weapons = settings.weaponSlots.map((size, index) => {
    const slotKey = `weapon-${index}`;
    const lockedId = settings.lockedSlots[slotKey];
    if (lockedId) {
      return WEAPONS.find((w) => w.id === lockedId) ?? null;
    }
    return pickRandom(availableWeapons(size, settings));
  });

  const tools = Array.from({ length: settings.maxTools }, (_, index) => {
    const slotKey = `tool-${index}`;
    const lockedId = settings.lockedSlots[slotKey];
    if (lockedId) return TOOLS.find((t) => t.id === lockedId) ?? null;
    return pickRandom(availableTools(settings));
  });

  const consumables = Array.from(
    { length: settings.maxConsumables },
    (_, index) => {
      const slotKey = `consumable-${index}`;
      const lockedId = settings.lockedSlots[slotKey];
      if (lockedId) {
        return CONSUMABLES.find((c) => c.id === lockedId) ?? null;
      }
      return pickRandom(availableConsumables(settings));
    }
  );

  const traits = pickTraits(settings);

  const totalPrice =
    weapons.reduce(
      (sum, w) =>
        sum + (w ? effectivePrice(w.price, w.scarce, settings.quartermaster) : 0),
      0
    ) +
    tools.reduce(
      (sum, t) =>
        sum + (t ? effectivePrice(t.price, t.scarce, settings.quartermaster) : 0),
      0
    ) +
    consumables.reduce(
      (sum, c) =>
        sum + (c ? effectivePrice(c.price, c.scarce, settings.quartermaster) : 0),
      0
    );

  const totalTraitPoints = traits.reduce((sum, t) => sum + t.points, 0);

  return { weapons, tools, consumables, traits, totalPrice, totalTraitPoints };
}

// Кілька спроб, щоб влучити в ціновий ліміт і ліміт дефіцитних предметів,
// не перетворюючи це на нескінченний цикл.
const MAX_ATTEMPTS = 30;

export function generateLoadout(settings: RandomizerSettings): Loadout {
  let best: Loadout | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = buildLoadout(settings);
    if (isLoadoutValid(candidate, settings)) {
      return candidate;
    }
    if (!best || candidate.totalPrice < best.totalPrice) {
      best = candidate;
    }
  }

  // Якщо жоден варіант не вклався ідеально — повертаємо найдешевший з отриманих.
  return best as Loadout;
}

export function weaponSlotWeightUsed(loadout: Loadout): number {
  return loadout.weapons.reduce(
    (sum, w) => sum + (w ? weaponWeight(w.size) : 0),
    0
  );
}

// --- Twitch overlay generator -------------------------------------------
// Немає поняття "rank" — трейт-кап задається напряму слайдером у control
// panel, а не виводиться зі шкали рангу.

const OVERLAY_WEAPON_SLOTS = 2;

function pickOverlayTraits(settings: OverlaySettings): Trait[] {
  const pool = TRAITS.filter(
    (t) => !settings.bannedItemIds.includes(t.id)
  ).sort(() => Math.random() - 0.5);

  const picked: Trait[] = [];
  let usedPoints = 0;

  for (const trait of pool) {
    if (picked.length >= MAX_TRAITS) break;
    if (usedPoints + trait.points <= settings.traitPointCap) {
      picked.push(trait);
      usedPoints += trait.points;
    }
  }
  return picked;
}

function pickOverlayWeapons(
  capacity: number,
  settings: OverlaySettings
): (Weapon | null)[] {
  const pool = WEAPONS.filter((w) => !settings.bannedItemIds.includes(w.id));

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked: Weapon[] = [];
    let usedWeight = 0;

    for (const weapon of shuffled) {
      if (picked.length >= OVERLAY_WEAPON_SLOTS) break;
      const weight = weaponWeight(weapon.size);
      if (usedWeight + weight <= capacity) {
        picked.push(weapon);
        usedWeight += weight;
      }
    }

    if (picked.length === OVERLAY_WEAPON_SLOTS) {
      return picked;
    }
  }

  // Не змогли влучити в бюджет за MAX_ATTEMPTS спроб — повертаємо
  // найдешевший single-weapon варіант, аби оверлей не лишався порожнім.
  const cheapest = [...pool].sort(
    (a, b) => weaponWeight(a.size) - weaponWeight(b.size)
  )[0];
  return [cheapest ?? null, null];
}

function pickOverlayItems<T extends { id: string }>(
  pool: T[],
  count: number,
  settings: OverlaySettings
): (T | null)[] {
  const available = pool.filter((i) => !settings.bannedItemIds.includes(i.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  // Без повторів, поки вистачає унікальних предметів; якщо ні — розширюємо
  // випадковим добором з повного пулу, аби не лишати слот порожнім.
  const picked = shuffled.slice(0, count);
  while (picked.length < count && available.length > 0) {
    picked.push(pickRandom(available) as T);
  }
  return Array.from({ length: count }, (_, i) => picked[i] ?? null);
}

export function generateOverlayLoadout(settings: OverlaySettings): Loadout {
  const traits = pickOverlayTraits(settings);
  const capacity = effectiveWeaponCapacity(traits);
  const weapons = pickOverlayWeapons(capacity, settings);
  const tools = pickOverlayItems(TOOLS, settings.maxTools, settings);
  const consumables = pickOverlayItems(
    CONSUMABLES,
    settings.maxConsumables,
    settings
  );

  const totalPrice =
    weapons.reduce((sum, w) => sum + (w ? w.price : 0), 0) +
    tools.reduce((sum, t) => sum + (t ? t.price : 0), 0) +
    consumables.reduce((sum, c) => sum + (c ? c.price : 0), 0);

  const totalTraitPoints = traits.reduce((sum, t) => sum + t.points, 0);

  return { weapons, tools, consumables, traits, totalPrice, totalTraitPoints };
}
