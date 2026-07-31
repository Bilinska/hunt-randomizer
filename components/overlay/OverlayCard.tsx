import type { Loadout } from "@/lib/types";

interface Props {
  loadout: Loadout | null;
}

export function OverlayCard({ loadout }: Props) {
  if (!loadout) return null;

  return (
    <div
      style={{
        maxWidth: 420,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius)",
        padding: "12px 14px",
        background: "rgba(23,23,28,0.85)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>
          HUNT LOADOUT
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>[R] reroll</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
        {loadout.weapons.map((w, i) => (
          <div
            key={i}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "8px 10px",
              fontSize: 13
            }}
          >
            {w ? w.name : "—"}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {loadout.tools.map((t, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "6px 8px",
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-secondary)"
            }}
          >
            {t ? t.name : "—"}
          </div>
        ))}
        {loadout.consumables.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "6px 8px",
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-secondary)"
            }}
          >
            {c ? c.name : "—"}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        {loadout.traits.map((t) => (
          <span
            key={t.id}
            style={{
              fontSize: 10,
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "2px 8px",
              color: "var(--text-secondary)"
            }}
          >
            {t.name}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border)",
          paddingTop: 8,
          fontSize: 12
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>cost</span>
        <span style={{ fontWeight: 600 }}>{loadout.totalPrice} hunt $</span>
      </div>
    </div>
  );
}
