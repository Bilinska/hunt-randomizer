"use client";

import { useEffect, useRef, useState } from "react";
import type { OverlayEvent } from "@/lib/types";

export function useOverlaySocket() {
  const [event, setEvent] = useState<OverlayEvent>({ type: "idle" });
  const retryRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${protocol}//${window.location.host}/ws/overlay`);

      socket.onmessage = (msg) => {
        try {
          setEvent(JSON.parse(msg.data) as OverlayEvent);
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        if (!cancelled) {
          retryRef.current = setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      socket?.close();
    };
  }, []);

  return event;
}
