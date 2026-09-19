import { NextResponse } from "next/server";
import { twitchConnectionStatus } from "@/lib/server/twitchRuntime";

export function GET() {
  return NextResponse.json(twitchConnectionStatus());
}
