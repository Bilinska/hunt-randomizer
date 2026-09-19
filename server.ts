// Custom Next.js server: adds a WebSocket endpoint (/ws/overlay) for pushing
// live rolls to the OBS browser source, and boots the Twitch EventSub
// connection on startup. Run via `npm run dev` / `npm start` — this app is
// meant to run locally on the streamer's own machine, alongside OBS, since
// it holds a live Twitch connection and OAuth tokens on disk.
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createServer } from "http";
import next from "next";
import { WebSocketServer } from "ws";
import { attachOverlayHub } from "./lib/server/overlayHub";
import { initTwitchRuntime } from "./lib/server/twitchRuntime";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev });
const handle = app.getRequestHandler();
const handleUpgrade = app.getUpgradeHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const wss = new WebSocketServer({ noServer: true });
  attachOverlayHub(wss);

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws/overlay") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      // Next's own dev-mode HMR websocket lives on this same server.
      handleUpgrade(req, socket, head);
    }
  });

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> Bayou Roulette ready on http://localhost:${port}`);
    void initTwitchRuntime();
  });
});
