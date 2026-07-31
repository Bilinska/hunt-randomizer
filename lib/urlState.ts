import type { Loadout, RandomizerSettings, WeaponSize } from "./types";

// Кодуємо тільки НАЛАШТУВАННЯ (не результат) — при відкритті лінка
// сторінка сама генерує лоадаут за цими параметрами. Це коротше за URL
// і дозволяє "reroll" навіть по спільному лінку.
export function encodeSettingsToQuery(settings: RandomizerSettings): string {
  const params = new URLSearchParams();
  if (settings.priceLimit !== null) {
    params.set("price", String(settings.priceLimit));
  }
  params.set("rank", String(settings.rank));
  params.set("qm", settings.quartermaster ? "1" : "0");
  params.set("slots", settings.weaponSlots.join(","));
  params.set("tools", String(settings.maxTools));
  params.set("cons", String(settings.maxConsumables));
  if (settings.bannedItemIds.length > 0) {
    params.set("ban", settings.bannedItemIds.join(","));
  }
  const lockedEntries = Object.entries(settings.lockedSlots).filter(
    ([, v]) => v !== null
  );
  if (lockedEntries.length > 0) {
    params.set(
      "lock",
      lockedEntries.map(([k, v]) => `${k}:${v}`).join(",")
    );
  }
  return params.toString();
}

export function decodeSettingsFromQuery(
  searchParams: URLSearchParams
): RandomizerSettings {
  const priceRaw = searchParams.get("price");
  const slotsRaw = searchParams.get("slots");
  const banRaw = searchParams.get("ban");
  const lockRaw = searchParams.get("lock");

  const lockedSlots: Record<string, string | null> = {};
  if (lockRaw) {
    for (const pair of lockRaw.split(",")) {
      const [key, value] = pair.split(":");
      if (key && value) lockedSlots[key] = value;
    }
  }

  return {
    priceLimit: priceRaw ? Number(priceRaw) : null,
    rank: Number(searchParams.get("rank") ?? "1"),
    quartermaster: searchParams.get("qm") === "1",
    weaponSlots: (slotsRaw
      ? slotsRaw.split(",")
      : ["big", "medium"]) as WeaponSize[],
    lockedSlots,
    bannedItemIds: banRaw ? banRaw.split(",") : [],
    maxTools: Number(searchParams.get("tools") ?? "1"),
    maxConsumables: Number(searchParams.get("cons") ?? "2")
  };
}

// Для кнопки "share" на головній сторінці — повний лінк, готовий до копіювання.
export function buildShareUrl(
  basePath: string,
  settings: RandomizerSettings
): string {
  const query = encodeSettingsToQuery(settings);
  return `${basePath}?${query}`;
}
