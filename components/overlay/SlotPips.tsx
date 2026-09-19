import { u } from "./scale";

interface Props {
  used: number;
  capacity: number;
  size?: number;
}

export function SlotPips({ used, capacity, size = 7 }: Props) {
  return (
    <span style={{ display: "inline-flex", gap: u(3), alignItems: "center" }}>
      {Array.from({ length: capacity }, (_, i) => (
        <span
          key={i}
          style={{
            width: u(size),
            height: u(size),
            borderRadius: "50%",
            background: i < used ? "var(--accent-cyan)" : "transparent",
            border: `${u(1)} solid ${i < used ? "var(--accent-cyan)" : "var(--border-strong)"}`
          }}
        />
      ))}
    </span>
  );
}
