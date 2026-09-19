"use client";

import { useState } from "react";
import { useLoadout } from "@/hooks/useLoadout";
import { WeaponSlotCard } from "@/components/WeaponSlotCard";
import { ConsumableSlot } from "@/components/ConsumableSlot";
import { TraitPicker } from "@/components/TraitPicker";
import { PriceIndicator } from "@/components/PriceIndicator";
import { GenerateButton } from "@/components/GenerateButton";
import { buildShareUrl } from "@/lib/urlState";
import { getMaxTraitPoints } from "@/lib/rules";
import type { RandomizerSettings } from "@/lib/types";

const DEFAULT_SETTINGS: RandomizerSettings = {
  priceLimit: 300,
  rank: 50,
  hunterLevel: 50,
  quartermaster: false,
  weaponSlots: ["big", "medium"],
  lockedSlots: {},
  bannedItemIds: [],
  maxTools: 4,
  maxConsumables: 4
};

export default function HomePage() {
  const {
    settings,
    loadout,
    generate,
    lockSlot,
    unlockSlot,
    banItem,
    updateSettings
  } = useLoadout(DEFAULT_SETTINGS);

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${buildShareUrl("/", settings)}`
        : "";
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          marginBottom: 12
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          Hunt: Showdown 1896 — randomizer
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 12
        }}
      >
        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>
          price limit, hunt $
          <input
            type="number"
            value={settings.priceLimit ?? ""}
            onChange={(e) =>
              updateSettings({
                priceLimit: e.target.value ? Number(e.target.value) : null
              })
            }
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>
          rank
          <input
            type="number"
            value={settings.rank}
            onChange={(e) => updateSettings({ rank: Number(e.target.value) })}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
        <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>
          hunter level
          <input
            type="number"
            min={1}
            max={50}
            value={settings.hunterLevel}
            onChange={(e) => updateSettings({ hunterLevel: Number(e.target.value) })}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--text-muted)"
          }}
        >
          <input
            type="checkbox"
            checked={settings.quartermaster}
            onChange={(e) => updateSettings({ quartermaster: e.target.checked })}
          />
          quartermaster
        </label>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 6px" }}>
        weapon slots
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {settings.weaponSlots.map((size, index) => {
          const slotKey = `weapon-${index}`;
          const isLocked = Boolean(settings.lockedSlots[slotKey]);
          const weapon = loadout?.weapons[index] ?? null;
          return (
            <WeaponSlotCard
              key={slotKey}
              size={size}
              weapon={weapon}
              isLocked={isLocked}
              onLockToggle={() =>
                isLocked
                  ? unlockSlot(slotKey)
                  : weapon && lockSlot(slotKey, weapon.id)
              }
              onReroll={generate}
              onBan={() => weapon && banItem(weapon.id)}
            />
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {loadout?.tools.map((t, i) => (
          <ConsumableSlot key={`tool-${i}`} label="tool" category="tools" item={t ?? null} />
        ))}
        {loadout?.consumables.map((c, i) => (
          <ConsumableSlot
            key={`cons-${i}`}
            label="consumable"
            category="consumables"
            item={c ?? null}
          />
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <TraitPicker
          traits={loadout?.traits ?? []}
          usedPoints={loadout?.totalTraitPoints ?? 0}
          maxPoints={getMaxTraitPoints(settings.hunterLevel)}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <GenerateButton onClick={generate} />
        <button
          onClick={handleShare}
          style={{
            flex: 1,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 12,
            background: "transparent",
            color: "var(--text-primary)"
          }}
        >
          {copied ? "copied" : "share"}
        </button>
      </div>

      {loadout && (
        <PriceIndicator totalPrice={loadout.totalPrice} priceLimit={settings.priceLimit} />
      )}
    </div>
  );
}
