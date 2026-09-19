import type { WebSocket, WebSocketServer } from "ws";
import type { OverlayEvent } from "../types";

// server.ts (run directly via tsx) and the Next-bundled API routes
// (app/api/**/route.ts) live in separate module registries even though
// they're the same Node process — a plain module-level variable here would
// be two different variables depending on who imported it. globalThis is
// the one thing both sides actually share, so the hub state lives there.
interface HubState {
  wss: WebSocketServer | null;
  lastEvent: OverlayEvent;
}

const g = globalThis as unknown as { __bayouOverlayHub?: HubState };
if (!g.__bayouOverlayHub) {
  g.__bayouOverlayHub = { wss: null, lastEvent: { type: "idle" } };
}
const state = g.__bayouOverlayHub;

export function attachOverlayHub(server: WebSocketServer) {
  state.wss = server;
  server.on("connection", (socket: WebSocket) => {
    // Дати новому клієнту (напр. щойно відкритому OBS browser source)
    // поточний стан, а не чекати наступного ролу.
    socket.send(JSON.stringify(state.lastEvent));
  });
}

export function broadcastOverlayEvent(event: OverlayEvent) {
  state.lastEvent = event;
  if (!state.wss) return;
  const payload = JSON.stringify(event);
  for (const client of state.wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
}

export function getLastOverlayEvent(): OverlayEvent {
  return state.lastEvent;
}
