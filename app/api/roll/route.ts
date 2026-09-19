import { NextResponse } from "next/server";
import { roll } from "@/lib/server/rollEngine";

// Manual/test trigger used by the control panel's "Roll all three" button
// and by the layout "Preview" links — always bypasses cooldown.
export function POST() {
  const event = roll({ source: "manual", roller: "you", bypassCooldown: true });
  return NextResponse.json(event ?? { ok: false });
}
