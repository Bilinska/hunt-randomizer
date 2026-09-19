import { NextRequest, NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/server/store";
import type { OverlaySettings } from "@/lib/types";

export function GET() {
  return NextResponse.json(readSettings());
}

export async function POST(req: NextRequest) {
  const patch = (await req.json()) as Partial<OverlaySettings>;
  const current = readSettings();
  const next: OverlaySettings = { ...current, ...patch };
  writeSettings(next);
  return NextResponse.json(next);
}
