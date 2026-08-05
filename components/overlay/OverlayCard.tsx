import type { Loadout } from "@/lib/types";
import { ItemImage } from "@/components/ItemImage";

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
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "8px 10px",
              fontSize: 13
            }}
          >
            {w && (
              <ItemImage category="weapons" id={w.id} image={w.image} alt={w.name} size={28} />
            )}
            <span>{w ? w.name : "—"}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {loadout.tools.map((t, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "6px 8px",
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-secondary)"
            }}
          >
            {t && <ItemImage category="tools" id={t.id} image={t.image} alt={t.name} size={24} />}
            <span>{t ? t.name : "—"}</span>
          </div>
        ))}
        {loadout.consumables.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "6px 8px",
              textAlign: "center",
              fontSize: 11,
              color: "var(--text-secondary)"
            }}
          >
            {c && (
              <ItemImage category="consumables" id={c.id} image={c.image} alt={c.name} size={24} />
            )}
            <span>{c ? c.name : "—"}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
        {loadout.traits.map((t) => (
          <span
            key={t.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "2px 8px 2px 2px",
              color: "var(--text-secondary)"
            }}
          >
            <ItemImage
              category="traits"
              id={t.id}
              image={t.image}
              alt={t.name}
              size={16}
              style={{ borderRadius: "50%" }}
            />
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
