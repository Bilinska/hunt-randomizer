import { NextResponse } from "next/server";
import { getValidToken, currentClientId } from "@/lib/server/twitchAuth";

const REWARDS_URL = "https://api.twitch.tv/helix/channel_points/custom_rewards";

export async function GET() {
  const token = await getValidToken();
  if (!token) {
    return NextResponse.json({ rewards: [] });
  }

  const res = await fetch(`${REWARDS_URL}?broadcaster_id=${token.userId}`, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Client-Id": currentClientId()
    }
  });

  if (!res.ok) {
    // Most common cause: the broadcaster doesn't have Affiliate/Partner
    // channel points enabled, or the reward list is simply empty.
    return NextResponse.json({ rewards: [] });
  }

  const body = (await res.json()) as { data: { id: string; title: string }[] };
  return NextResponse.json({
    rewards: body.data.map((r) => ({ id: r.id, title: r.title }))
  });
}
