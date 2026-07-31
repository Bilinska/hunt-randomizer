interface Props {
  label: string;
  name: string | null;
}

export function ConsumableSlot({ label, name }: Props) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "10px",
        textAlign: "center",
        background: "var(--surface)"
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13 }}>{name ?? "—"}</div>
    </div>
  );
}
