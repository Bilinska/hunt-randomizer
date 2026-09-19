import type { CSSProperties } from "react";
import type { RollEvent } from "@/lib/types";
import { WeaponRow } from "./WeaponRow";
import { SlotPips } from "./SlotPips";
import { TraitPill } from "./TraitPill";

export function DossierCard({ event }: { event: RollEvent }) {
  const { loadout } = event;

  return (
    <div
      style={{
        width: 340,
        background: "var(--overlay-bg)",
        border: "1px solid var(--border-strong)",
        borderRadius: 10,
        padding: "14px 16px",
        fontFamily: "var(--font-sans)",
        backdropFilter: "blur(6px)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 2
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            textTransform: "uppercase"
          }}
        >
          Random loadout
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          #{event.rollNumber}
        </span>
      </div>
      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 12
        }}
      >
        {event.hunterName}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            textTransform: "uppercase"
          }}
        >
          Weapons
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SlotPips used={event.weaponWeightUsed} capacity={event.weaponCapacity} />
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {event.weaponWeightUsed}/{event.weaponCapacity} slots
          </span>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 12,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12
        }}
      >
        <WeaponRow label="Primary" weapon={loadout.weapons[0] ?? null} />
        <WeaponRow label="Secondary" weapon={loadout.weapons[1] ?? null} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 12,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12
        }}
      >
        <div>
          <div style={sectionLabelStyle}>Tools</div>
          {loadout.tools.map((t, i) => (
            <div key={i} style={itemLineStyle}>
              {t ? t.name : "—"}
            </div>
          ))}
        </div>
        <div>
          <div style={sectionLabelStyle}>Consumables</div>
          {loadout.consumables.map((c, i) => (
            <div key={i} style={itemLineStyle}>
              {c ? c.name : "—"}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6
        }}
      >
        <span style={sectionLabelStyle}>Traits</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {loadout.totalTraitPoints} pts
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 5,
          marginBottom: 12
        }}
      >
        {loadout.traits.length === 0 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>
        )}
        {loadout.traits.map((t) => (
          <TraitPill key={t.id} trait={t} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          borderTop: "1px solid var(--border)",
          fontSize: 10,
          color: "var(--text-muted)"
        }}
      >
        <span>
          {event.source === "channel-points" ? "channel points" : "!loadout"} ·{" "}
          @{event.roller}
        </span>
        <span>cooldown resets soon</span>
      </div>
    </div>
  );
}

const sectionLabelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: 4
};

const itemLineStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
  lineHeight: 1.6,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
