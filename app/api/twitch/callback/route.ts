import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/server/twitchAuth";
import { consumePendingState } from "@/lib/server/oauthState";
import { reconnectTwitchRuntime } from "@/lib/server/twitchRuntime";
import { readSettings, writeSettings } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  const redirectBase = new URL("/overlay-setup", req.url);

  if (error || !code || !state || !consumePendingState(state)) {
    redirectBase.searchParams.set("twitch_error", error ?? "invalid_state");
    return NextResponse.redirect(redirectBase);
  }

  try {
    const token = await exchangeCodeForToken(code);
    const settings = readSettings();
    writeSettings({ ...settings, channel: token.login });
    await reconnectTwitchRuntime();
    redirectBase.searchParams.set("connected", "1");
  } catch (err) {
    redirectBase.searchParams.set(
      "twitch_error",
      err instanceof Error ? err.message : "unknown_error"
    );
  }

  return NextResponse.redirect(redirectBase);
}
