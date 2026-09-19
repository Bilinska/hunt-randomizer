interface Props {
  used: number;
  capacity: number;
  size?: number;
}

export function SlotPips({ used, capacity, size = 7 }: Props) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {Array.from({ length: capacity }, (_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: i < used ? "var(--accent-cyan)" : "transparent",
            border: `1px solid ${i < used ? "var(--accent-cyan)" : "var(--border-strong)"}`
          }}
        />
      ))}
    </span>
  );
}
