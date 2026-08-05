interface Props {
  onClick: () => void;
}

export function GenerateButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 2,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius)",
        padding: "12px",
        textAlign: "center",
        fontSize: 14,
        fontWeight: 600,
        background: "var(--surface-2)",
        color: "var(--text-primary)",
      }}
    >
      🎲 generate loadout
    </button>
  );
}
