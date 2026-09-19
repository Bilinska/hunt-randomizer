// Twitch OAuth (Authorization Code grant, confidential client) + token refresh.
// Docs: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow
import { clearToken, readToken, writeToken, type TwitchToken } from "./store";

const AUTHORIZE_URL = "https://id.twitch.tv/oauth2/authorize";
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const VALIDATE_URL = "https://id.twitch.tv/oauth2/validate";
const REVOKE_URL = "https://id.twitch.tv/oauth2/revoke";
const HELIX_USERS_URL = "https://api.twitch.tv/helix/users";

// Chat read via EventSub + channel-point redemption read. No chat-write scope
// is requested — the overlay itself is the feedback, we never post to chat.
export const TWITCH_SCOPES = ["user:read:chat", "channel:read:redemptions"];

function clientId() {
  const id = process.env.TWITCH_CLIENT_ID;
  if (!id) throw new Error("TWITCH_CLIENT_ID is not set (see .env.example)");
  return id;
}

function clientSecret() {
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!secret) throw new Error("TWITCH_CLIENT_SECRET is not set (see .env.example)");
  return secret;
}

function redirectUri() {
  return (
    process.env.TWITCH_REDIRECT_URI ??
    `http://localhost:${process.env.PORT ?? "3000"}/api/twitch/callback`
  );
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: TWITCH_SCOPES.join(" "),
    state
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

interface RawTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

async function fetchUserInfo(accessToken: string): Promise<{ id: string; login: string }> {
  const res = await fetch(HELIX_USERS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId()
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch Twitch user info: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { data: { id: string; login: string }[] };
  const user = body.data[0];
  if (!user) throw new Error("Twitch /users returned no data for this token");
  return user;
}

export async function exchangeCodeForToken(code: string): Promise<TwitchToken> {
  const params = new URLSearchParams({
    client_id: clientId(),
    client_secret: clientSecret(),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri()
  });

  const res = await fetch(TOKEN_URL, { method: "POST", body: params });
  if (!res.ok) {
    throw new Error(`Twitch token exchange failed: ${res.status} ${await res.text()}`);
  }
  const raw = (await res.json()) as RawTokenResponse;
  const user = await fetchUserInfo(raw.access_token);

  const token: TwitchToken = {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    expiresAt: Date.now() + raw.expires_in * 1000,
    userId: user.id,
    login: user.login
  };
  writeToken(token);
  return token;
}

export async function refreshAccessToken(token: TwitchToken): Promise<TwitchToken> {
  const params = new URLSearchParams({
    client_id: clientId(),
    client_secret: clientSecret(),
    grant_type: "refresh_token",
    refresh_token: token.refreshToken
  });

  const res = await fetch(TOKEN_URL, { method: "POST", body: params });
  if (!res.ok) {
    throw new Error(`Twitch token refresh failed: ${res.status} ${await res.text()}`);
  }
  const raw = (await res.json()) as RawTokenResponse;
  const next: TwitchToken = {
    ...token,
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    expiresAt: Date.now() + raw.expires_in * 1000
  };
  writeToken(next);
  return next;
}

/** Returns a token guaranteed to be valid for at least another 60s, refreshing if needed. */
export async function getValidToken(): Promise<TwitchToken | null> {
  const token = readToken();
  if (!token) return null;
  if (token.expiresAt - Date.now() > 60_000) return token;
  try {
    return await refreshAccessToken(token);
  } catch {
    clearToken();
    return null;
  }
}

export async function disconnectTwitch(): Promise<void> {
  const token = readToken();
  if (token) {
    try {
      const params = new URLSearchParams({
        client_id: clientId(),
        token: token.accessToken
      });
      await fetch(`${REVOKE_URL}?${params.toString()}`, { method: "POST" });
    } catch {
      // best-effort revoke; local token is cleared regardless
    }
  }
  clearToken();
}

export async function isTokenValid(token: TwitchToken): Promise<boolean> {
  const res = await fetch(VALIDATE_URL, {
    headers: { Authorization: `OAuth ${token.accessToken}` }
  });
  return res.ok;
}

export function currentClientId(): string {
  return clientId();
}
