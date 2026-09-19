// Single-user local app — an in-memory pending OAuth state is enough to
// guard the round trip against CSRF, no session store needed.
//
// Next compiles each API route separately in dev, so /api/twitch/authorize
// and /api/twitch/callback get their own copies of this module — a plain
// module-level variable would be set in one and read as null in the other
// (invalid_state). globalThis is shared by both, same as overlayHub.
const g = globalThis as unknown as { __bayouPendingOAuthState?: string | null };

export function setPendingState(state: string) {
  g.__bayouPendingOAuthState = state;
}

export function consumePendingState(state: string): boolean {
  const pending = g.__bayouPendingOAuthState ?? null;
  g.__bayouPendingOAuthState = null;
  return pending !== null && pending === state;
}
