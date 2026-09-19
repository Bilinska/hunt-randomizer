"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useOverlaySocket } from "@/components/overlay/useOverlaySocket";
import { DossierCard } from "@/components/overlay/DossierCard";
import { TickerCard } from "@/components/overlay/TickerCard";
import { FieldCard } from "@/components/overlay/FieldCard";
import { buildDemoRollEvent } from "@/lib/demoLoadout";
import type { OverlayLayout, RollEvent } from "@/lib/types";

const LAYOUTS: Record<OverlayLayout, typeof DossierCard> = {
  dossier: DossierCard,
  ticker: TickerCard,
  field: FieldCard
};

export default function OverlayLayoutPage() {
  const params = useParams<{ layout: string }>();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  const liveEvent = useOverlaySocket();
  const [demoEvent, setDemoEvent] = useState<RollEvent | null>(null);

  useEffect(() => {
    if (!isDemo) return;
    setDemoEvent(buildDemoRollEvent());
  }, [isDemo]);

  const layout = (params.layout in LAYOUTS ? params.layout : "dossier") as OverlayLayout;
  const Card = LAYOUTS[layout];
  const event = isDemo ? demoEvent : liveEvent.type === "roll" ? liveEvent : null;

  return (
    <>
      {/* The global body background is opaque; an OBS browser source must be
          see-through even if its Custom CSS was cleared. */}
      <style>{"html, body { background: transparent !important; }"}</style>
      <div
        style={{
          background: "transparent",
          minHeight: "100vh",
          display: "flex",
          alignItems: layout === "ticker" ? "flex-end" : "flex-start",
          justifyContent: layout === "ticker" ? "center" : "flex-start",
          padding: 20
        }}
      >
        {event && <Card event={event} />}
      </div>
    </>
  );
}
