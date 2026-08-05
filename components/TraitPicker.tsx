import type { Trait } from "@/lib/types";
import { ItemImage } from "@/components/ItemImage";

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
        background: "var(--surface)",
      }}
    >
      <div style={{ fontSize: 14, marginBottom: 6 }}>Traits</div>
      <div
        style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}
      >
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
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              border: "1px solid var(--border-strong)",
              borderRadius: 12,
              padding: "3px 10px 3px 3px",
            }}
          >
            <ItemImage
              category="traits"
              id={trait.id}
              image={trait.image}
              alt={trait.name}
              size={20}
              style={{ borderRadius: "50%" }}
            />
            {trait.name}
          </span>
        ))}
      </div>
    </div>
  );
}
