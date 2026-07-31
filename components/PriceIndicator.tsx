interface Props {
  totalPrice: number;
  priceLimit: number | null;
}

function getColor(totalPrice: number, priceLimit: number | null): string {
  if (priceLimit === null) return "var(--text-primary)";
  const ratio = totalPrice / priceLimit;
  if (ratio <= 0.9) return "var(--success)";
  if (ratio <= 1) return "var(--accent)";
  return "var(--danger)";
}

export function PriceIndicator({ totalPrice, priceLimit }: Props) {
  return (
    <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
      сумарна ціна:{" "}
      <span style={{ color: getColor(totalPrice, priceLimit), fontWeight: 600 }}>
        {totalPrice} hunt $
      </span>
      {priceLimit !== null && <> / ліміт {priceLimit} hunt $</>}
    </div>
  );
}
