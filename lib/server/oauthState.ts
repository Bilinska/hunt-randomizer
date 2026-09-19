// Single-user local app — an in-memory pending OAuth state is enough to
// guard the round trip against CSRF, no session store needed.
let pendingState: string | null = null;

export function setPendingState(state: string) {
  pendingState = state;
}

export function consumePendingState(state: string): boolean {
  const ok = pendingState !== null && pendingState === state;
  pendingState = null;
  return ok;
}
