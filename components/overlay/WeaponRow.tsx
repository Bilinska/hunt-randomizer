import type { Weapon, WeaponSize } from "@/lib/types";
import { weaponWeight } from "@/lib/rules";

const SIZE_LABEL: Record<WeaponSize, string> = {
  small: "Small",
  medium: "Medium",
  big: "Large"
};

interface Props {
  label: "Primary" | "Secondary";
  weapon: Weapon | null;
  compact?: boolean;
}

export function WeaponRow({ label, weapon, compact }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 10
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
        {!compact && (
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              flexShrink: 0
            }}
          >
            {label}
          </span>
        )}
        <span
          style={{
            fontSize: compact ? 13 : 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {weapon ? weapon.name : "—"}
        </span>
      </div>
      {weapon && (
        <span
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            flexShrink: 0
          }}
        >
          {SIZE_LABEL[weapon.size]} · {weaponWeight(weapon.size)} slot
          {weaponWeight(weapon.size) > 1 ? "s" : ""}
          {weapon.ammoTypes.length > 0 ? ` · ${weapon.ammoTypes.join("/")}` : ""}
        </span>
      )}
    </div>
  );
}
