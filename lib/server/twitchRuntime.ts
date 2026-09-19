import { getValidToken } from "./twitchAuth";
import { startEventSub, stopEventSub, isEventSubConnected } from "./twitchEventSub";
import { readToken } from "./store";

/** Called once when the server boots — resumes a previously connected session, if any. */
export async function initTwitchRuntime(): Promise<void> {
  const token = await getValidToken();
  if (!token) return;
  await startEventSub();
}

/** Called right after a fresh OAuth callback stores a new token. */
export async function reconnectTwitchRuntime(): Promise<void> {
  stopEventSub();
  await startEventSub();
}

export function disconnectTwitchRuntime(): void {
  stopEventSub();
}

export function twitchConnectionStatus(): { connected: boolean; login: string | null } {
  const token = readToken();
  return {
    connected: Boolean(token) && isEventSubConnected(),
    login: token?.login ?? null
  };
}
