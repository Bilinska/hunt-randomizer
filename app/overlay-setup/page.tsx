"use client";

import { useState } from "react";
import { buildShareUrl } from "@/lib/urlState";
import type { RandomizerSettings } from "@/lib/types";

const DEFAULT_SETTINGS: RandomizerSettings = {
  priceLimit: 300,
  rank: 50,
  quartermaster: false,
  weaponSlots: ["big", "medium"],
  lockedSlots: {},
  bannedItemIds: [],
  maxTools: 4,
  maxConsumables: 4
};

export default function OverlaySetupPage() {
  const [settings, setSettings] = useState<RandomizerSettings>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  const overlayUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${buildShareUrl("/overlay", settings)}`
      : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        налаштування OBS-оверлею
      </h1>

      <label style={{ display: "block", fontSize: 12, marginBottom: 10 }}>
        price limit, hunt $
        <input
          type="number"
          value={settings.priceLimit ?? ""}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              priceLimit: e.target.value ? Number(e.target.value) : null
            }))
          }
          style={{ width: "100%", marginTop: 4 }}
        />
      </label>

      <label style={{ display: "block", fontSize: 12, marginBottom: 10 }}>
        rank
        <input
          type="number"
          value={settings.rank}
          onChange={(e) =>
            setSettings((s) => ({ ...s, rank: Number(e.target.value) }))
          }
          style={{ width: "100%", marginTop: 4 }}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={settings.quartermaster}
          onChange={(e) =>
            setSettings((s) => ({ ...s, quartermaster: e.target.checked }))
          }
        />
        quartermaster
      </label>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "10px 12px",
          fontSize: 12,
          wordBreak: "break-all",
          marginBottom: 10
        }}
      >
        {overlayUrl}
      </div>

      <button
        onClick={handleCopy}
        style={{
          width: "100%",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          padding: 12,
          background: "var(--surface-2)",
          color: "var(--text-primary)"
        }}
      >
        {copied ? "copied" : "copy url for OBS browser source"}
      </button>
    </div>
  );
}
