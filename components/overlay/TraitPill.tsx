import type { Trait } from "@/lib/types";
import { u } from "./scale";

export function TraitPill({ trait }: { trait: Trait }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: u(4),
        fontSize: u(11),
        fontWeight: 600,
        color: "var(--accent)",
        border: `${u(1)} solid rgba(196,138,63,0.45)`,
        background: "rgba(196,138,63,0.12)",
        borderRadius: 999,
        padding: `${u(3)} ${u(8)}`
      }}
    >
      {trait.name}
      <span style={{ opacity: 0.7, fontWeight: 400 }}>{trait.points}</span>
    </span>
  );
}
