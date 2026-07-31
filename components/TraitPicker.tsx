import type { Trait } from "@/lib/types";

interface Props {
  traits: Trait[];
  usedPoints: number;
  maxPoints: number;
}

export function TraitPicker({ traits, usedPoints, maxPoints }: Props) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "10px 12px",
        background: "var(--surface)"
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
        трейти (очки: {usedPoints} / {maxPoints})
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {traits.length === 0 && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
        )}
        {traits.map((trait) => (
          <span
            key={trait.id}
            style={{
              fontSize: 11,
              border: "1px solid var(--border-strong)",
              borderRadius: 12,
              padding: "3px 10px"
            }}
          >
            {trait.name}
          </span>
        ))}
      </div>
    </div>
  );
}
