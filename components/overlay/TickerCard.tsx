import type { CSSProperties } from "react";
import type { RollEvent } from "@/lib/types";
import { WeaponRow } from "./WeaponRow";
import { TraitPill } from "./TraitPill";

export function TickerCard({ event }: { event: RollEvent }) {
  const { loadout } = event;
  const kit = [...loadout.tools, ...loadout.consumables].filter(Boolean) as {
    id: string;
    name: string;
  }[];

  return (
    <div
      style={{
        width: 860,
        background: "var(--overlay-bg)",
        border: "1px solid var(--border-strong)",
        borderRadius: 10,
        padding: "10px 18px",
        display: "grid",
        gridTemplateColumns: "170px 1fr 220px",
        alignItems: "center",
        gap: 16,
        fontFamily: "var(--font-sans)",
        backdropFilter: "blur(6px)"
      }}
    >
      <div>
        <div style={labelStyle}>{event.replay ? "Previous loadout" : "Rolled loadout"}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
          {event.hunterName}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
          @{event.roller} · {event.weaponWeightUsed}/{event.weaponCapacity} slots
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <WeaponRow label="Primary" weapon={loadout.weapons[0] ?? null} compact />
        <WeaponRow label="Secondary" weapon={loadout.weapons[1] ?? null} compact />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginTop: 2
          }}
        >
          {kit.map((item) => (
            <span key={item.id} style={pillStyle}>
              {item.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
          {loadout.traits.map((t) => (
            <TraitPill key={t.id} trait={t} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {loadout.totalTraitPoints} pts
        </div>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  fontSize: 9,
  letterSpacing: "0.1em",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: 2
};

const pillStyle: CSSProperties = {
  fontSize: 10,
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 999,
  padding: "2px 7px"
};
