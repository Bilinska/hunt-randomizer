"use client";

import type { Weapon, WeaponSize } from "@/lib/types";
import { ItemImage } from "@/components/ItemImage";

interface Props {
  size: WeaponSize;
  weapon: Weapon | null;
  isLocked: boolean;
  onLockToggle: () => void;
  onReroll: () => void;
  onBan: () => void;
}

export function WeaponSlotCard({
  size,
  weapon,
  isLocked,
  onLockToggle,
  onReroll,
  onBan
}: Props) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "14px 10px",
        textAlign: "center",
        background: "var(--surface)"
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
        слот · {size}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        {weapon ? (
          <ItemImage
            category="weapons"
            id={weapon.id}
            image={weapon.image}
            alt={weapon.name}
            size={56}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 56,
              height: 56,
              borderRadius: 6,
              border: "1px dashed var(--border)"
            }}
          />
        )}
      </div>
      <div style={{ fontSize: 14 }}>{weapon ? weapon.name : "—"}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
        <button onClick={onLockToggle} aria-label="lock slot">
          {isLocked ? "🔒" : "🔓"}
        </button>
        <button onClick={onReroll} disabled={isLocked} aria-label="reroll slot">
          ↻
        </button>
        <button onClick={onBan} disabled={!weapon} aria-label="ban item">
          ✕
        </button>
      </div>
    </div>
  );
}
