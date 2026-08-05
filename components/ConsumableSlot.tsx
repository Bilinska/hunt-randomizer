import type { Consumable, Tool } from "@/lib/types";
import { ItemImage } from "@/components/ItemImage";

interface Props {
  label: string;
  category: "tools" | "consumables";
  item: Tool | Consumable | null;
}

export function ConsumableSlot({ label, category, item }: Props) {
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        {item ? (
          <ItemImage
            category={category}
            id={item.id}
            image={item.image}
            alt={item.name}
            size={36}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              border: "1px dashed var(--border)"
            }}
          />
        )}
      </div>
      <div style={{ fontSize: 13 }}>{item?.name ?? "—"}</div>
    </div>
  );
}
