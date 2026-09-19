import type { CSSProperties } from "react";
import type { RollEvent } from "@/lib/types";
import { WeaponRow } from "./WeaponRow";
import { SlotPips } from "./SlotPips";
import { TraitPill } from "./TraitPill";
import { u } from "./scale";

// The card is drawn on a 500-unit-tall design grid and stretched to the full
// viewport height: --u is one design unit, so width, type and spacing all grow
// with the height. Leaves headroom for a long trait list wrapping onto extra
// lines.
const DESIGN_HEIGHT = 500;
const DESIGN_WIDTH = 340;

export function DossierCard({ event }: { event: RollEvent }) {
  const { loadout } = event;

  return (
    <div
      style={
        {
          "--u": `calc(100vh / ${DESIGN_HEIGHT})`,
          boxSizing: "border-box",
          width: u(DESIGN_WIDTH),
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "var(--overlay-bg)",
          border: `${u(1)} solid var(--border-strong)`,
          borderRadius: u(10),
          padding: `${u(16)} ${u(18)}`,
          fontFamily: "var(--font-sans)",
          backdropFilter: `blur(${u(6)})`
        } as CSSProperties
      }
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: u(2)
          }}
        >
          <span
            style={{
              fontSize: u(10),
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              textTransform: "uppercase"
            }}
          >
            Random loadout
          </span>
          <span style={{ fontSize: u(10), color: "var(--text-muted)" }}>
            #{event.rollNumber}
          </span>
        </div>
        <div
          style={{
            fontSize: u(21),
            fontWeight: 700,
            color: "var(--text-primary)"
          }}
        >
          {event.hunterName}
        </div>
      </div>

      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: u(6)
          }}
        >
          <span style={{ ...sectionLabelStyle, marginBottom: 0 }}>Weapons</span>
          <span style={{ display: "flex", alignItems: "center", gap: u(6) }}>
            <SlotPips used={event.weaponWeightUsed} capacity={event.weaponCapacity} />
            <span style={{ fontSize: u(10), color: "var(--text-muted)" }}>
              {event.weaponWeightUsed}/{event.weaponCapacity} slots
            </span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: u(8) }}>
          <WeaponRow label="Primary" weapon={loadout.weapons[0] ?? null} />
          <WeaponRow label="Secondary" weapon={loadout.weapons[1] ?? null} />
        </div>
      </div>

      <div
        style={{
          ...sectionStyle,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: u(12)
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={sectionLabelStyle}>Tools</div>
          {loadout.tools.map((t, i) => (
            <div key={i} style={itemLineStyle}>
              {t ? t.name : "—"}
            </div>
          ))}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={sectionLabelStyle}>Consumables</div>
          {loadout.consumables.map((c, i) => (
            <div key={i} style={itemLineStyle}>
              {c ? c.name : "—"}
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: u(6)
          }}
        >
          <span style={{ ...sectionLabelStyle, marginBottom: 0 }}>Traits</span>
          <span style={{ fontSize: u(10), color: "var(--text-muted)" }}>
            {loadout.totalTraitPoints} pts
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: u(5) }}>
          {loadout.traits.length === 0 && (
            <span style={{ fontSize: u(11), color: "var(--text-muted)" }}>—</span>
          )}
          {loadout.traits.map((t) => (
            <TraitPill key={t.id} trait={t} />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: u(10),
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

// Each block after the header is closed off by a divider; space-between on the
// card spreads the blocks over the full height.
const sectionStyle: CSSProperties = {
  borderTop: `${u(1)} solid var(--border)`,
  paddingTop: u(12)
};

const sectionLabelStyle: CSSProperties = {
  fontSize: u(10),
  letterSpacing: "0.08em",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  marginBottom: u(4)
};

const itemLineStyle: CSSProperties = {
  fontSize: u(12),
  color: "var(--text-secondary)",
  lineHeight: 1.6,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
