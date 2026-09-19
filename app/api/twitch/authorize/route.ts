import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl } from "@/lib/server/twitchAuth";
import { setPendingState } from "@/lib/server/oauthState";

export function GET(req: NextRequest) {
  try {
    const state = randomBytes(16).toString("hex");
    setPendingState(state);
    return NextResponse.redirect(buildAuthorizeUrl(state));
  } catch (err) {
    // Most likely TWITCH_CLIENT_ID/SECRET missing from .env.local — send the
    // streamer back to the setup page with a readable message instead of a
    // raw Next.js error page.
    const redirectBase = new URL("/overlay-setup", req.url);
    redirectBase.searchParams.set(
      "twitch_error",
      err instanceof Error ? err.message : "twitch_not_configured"
    );
    return NextResponse.redirect(redirectBase);
  }
}
