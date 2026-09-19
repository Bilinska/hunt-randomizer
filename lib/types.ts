export type WeaponSize = "small" | "medium" | "big";

export interface Weapon {
  id: string;
  name: string;
  size: WeaponSize;
  price: number;
  minRank: number;
  scarce: boolean;
  ammoTypes: string[];
  image?: string;
}

export interface Tool {
  id: string;
  name: string;
  price: number;
  minRank: number;
  scarce: boolean;
  image?: string;
}

export interface Consumable {
  id: string;
  name: string;
  price: number;
  minRank: number;
  scarce: boolean;
  image?: string;
}

export interface Trait {
  id: string;
  name: string;
  points: number;
  minRank: number;
  image?: string;
}

export type WeaponSlotConfig = WeaponSize[]; // напр. ["big", "medium"]

export interface RandomizerSettings {
  priceLimit: number | null; // null = без ліміту
  rank: number;
  quartermaster: boolean; // впливає на ціну/доступність scarce-предметів
  weaponSlots: WeaponSlotConfig;
  lockedSlots: Record<string, string | null>; // slotKey -> itemId, якщо заблоковано
  bannedItemIds: string[];
  maxConsumables: number; // 0-4
  maxTools: number; // 0-4
}

export interface Loadout {
  weapons: (Weapon | null)[];
  tools: (Tool | null)[];
  consumables: (Consumable | null)[];
  traits: Trait[];
  totalPrice: number;
  totalTraitPoints: number;
}

export type OverlayLayout = "dossier" | "ticker" | "field";

export interface OverlaySettings {
  channel: string | null;
  chatCommand: string;
  cooldownSec: number;
  hideDelaySec: number;
  traitPointCap: number;
  maxTools: number;
  maxConsumables: number;
  bannedItemIds: string[];
  rewardId: string | null;
  rewardTitle: string | null;
  layout: OverlayLayout;
}

export interface RollEvent {
  type: "roll";
  loadout: Loadout;
  weaponCapacity: number;
  weaponWeightUsed: number;
  hunterName: string;
  roller: string;
  source: "chat" | "reroll" | "channel-points" | "manual";
  rollNumber: number;
  ts: number;
  hideDelaySec: number;
}

export interface IdleEvent {
  type: "idle";
}

export type OverlayEvent = RollEvent | IdleEvent;
