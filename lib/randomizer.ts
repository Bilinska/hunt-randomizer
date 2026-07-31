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
  RandomizerSettings
} from "./types";
import { getMaxTraitPoints, isLoadoutValid, weaponWeight } from "./rules";

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

  const maxPoints = getMaxTraitPoints(settings.rank);
  const picked: Trait[] = [];
  let usedPoints = 0;

  for (const trait of pool) {
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
