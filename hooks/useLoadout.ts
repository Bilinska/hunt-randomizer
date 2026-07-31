"use client";

import { useCallback, useState } from "react";
import type { Loadout, RandomizerSettings } from "@/lib/types";
import { generateLoadout } from "@/lib/randomizer";

export function useLoadout(initialSettings: RandomizerSettings) {
  const [settings, setSettings] = useState<RandomizerSettings>(initialSettings);
  const [loadout, setLoadout] = useState<Loadout | null>(null);

  const generate = useCallback(() => {
    setLoadout(generateLoadout(settings));
  }, [settings]);

  const reroll = useCallback(() => {
    generate();
  }, [generate]);

  const lockSlot = useCallback((slotKey: string, itemId: string) => {
    setSettings((prev) => ({
      ...prev,
      lockedSlots: { ...prev.lockedSlots, [slotKey]: itemId }
    }));
  }, []);

  const unlockSlot = useCallback((slotKey: string) => {
    setSettings((prev) => ({
      ...prev,
      lockedSlots: { ...prev.lockedSlots, [slotKey]: null }
    }));
  }, []);

  const banItem = useCallback((itemId: string) => {
    setSettings((prev) => ({
      ...prev,
      bannedItemIds: prev.bannedItemIds.includes(itemId)
        ? prev.bannedItemIds
        : [...prev.bannedItemIds, itemId]
    }));
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<RandomizerSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  return {
    settings,
    loadout,
    generate,
    reroll,
    lockSlot,
    unlockSlot,
    banItem,
    updateSettings
  };
}
