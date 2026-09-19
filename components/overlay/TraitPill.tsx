import type { Trait } from "@/lib/types";

export function TraitPill({ trait }: { trait: Trait }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        color: "var(--accent)",
        border: "1px solid rgba(196,138,63,0.45)",
        background: "rgba(196,138,63,0.12)",
        borderRadius: 999,
        padding: "3px 8px"
      }}
    >
      {trait.name}
      <span style={{ opacity: 0.7, fontWeight: 400 }}>{trait.points}</span>
    </span>
  );
}
