"use client";

import type { Weapon, WeaponSize } from "@/lib/types";

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
