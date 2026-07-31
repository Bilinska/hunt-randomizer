"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLoadout } from "@/hooks/useLoadout";
import { OverlayCard } from "@/components/overlay/OverlayCard";
import { decodeSettingsFromQuery } from "@/lib/urlState";

export default function OverlayPage() {
  const searchParams = useSearchParams();
  const settings = decodeSettingsFromQuery(searchParams);
  const { loadout, generate } = useLoadout(settings);

  // Генеруємо перший лоадаут одразу при завантаженні оверлею.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Гаряча клавіша "R" — рероль без кліків, стрімер не відволікається від гри.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") {
        generate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generate]);

  return (
    <div style={{ background: "transparent", padding: 16 }}>
      <OverlayCard loadout={loadout} />
    </div>
  );
}
