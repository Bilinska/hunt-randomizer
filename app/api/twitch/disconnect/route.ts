import { NextResponse } from "next/server";
import { disconnectTwitch } from "@/lib/server/twitchAuth";
import { disconnectTwitchRuntime } from "@/lib/server/twitchRuntime";
import { readSettings, writeSettings } from "@/lib/server/store";

export async function POST() {
  disconnectTwitchRuntime();
  await disconnectTwitch();
  writeSettings({ ...readSettings(), channel: null });
  return NextResponse.json({ connected: false });
}
