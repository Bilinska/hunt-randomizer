import type { RollEvent } from "@/lib/types";

export function FieldCard({ event }: { event: RollEvent }) {
  const { loadout } = event;
  const kit = [...loadout.tools, ...loadout.consumables]
    .filter(Boolean)
    .map((i) => i!.name);
  const hasQuartermaster = loadout.traits.some((t) => t.id === "quartermaster");

  return (
    <div
      style={{
        width: 240,
        background: "var(--overlay-bg)",
        border: "1px solid var(--border-strong)",
        borderRadius: 10,
        padding: "10px 12px",
        fontFamily: "var(--font-sans)",
        backdropFilter: "blur(6px)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-cyan)" }}>
          {event.replay ? "previous" : event.source === "channel-points" ? "points" : "!loadout"}
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>@{event.roller}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
        {loadout.weapons.map((w, i) => (
          <div
            key={i}
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {w ? w.name : "—"}
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          marginBottom: hasQuartermaster ? 6 : 0
        }}
      >
        {kit.join(" · ")}
      </div>

      {hasQuartermaster && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--accent)",
            marginBottom: 6
          }}
        >
          Quartermaster — 6th slot unlocked
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 6,
          borderTop: "1px solid var(--border)",
          fontSize: 10,
          color: "var(--text-muted)"
        }}
      >
        <span>
          {event.weaponWeightUsed}/{event.weaponCapacity} slots
        </span>
        <span>{loadout.totalPrice} hunt $</span>
      </div>
    </div>
  );
}

