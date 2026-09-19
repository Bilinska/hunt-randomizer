"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { OverlayLayout, OverlaySettings } from "@/lib/types";

const LAYOUTS: {
  id: OverlayLayout;
  title: string;
  blurb: string;
}[] = [
  {
    id: "dossier",
    title: "Dossier — left rail",
    blurb: "Full contract sheet. Sits under the camera, readable on VOD."
  },
  {
    id: "ticker",
    title: "Ticker — lower third",
    blurb: "Keeps the play area clear. Best for busy gunfights."
  },
  {
    id: "field",
    title: "Field card — corner",
    blurb: "Minimal: weapons loud, kit quiet."
  }
];

interface Reward {
  id: string;
  title: string;
}

interface Status {
  connected: boolean;
  login: string | null;
}

export default function OverlaySetupPage() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<OverlaySettings | null>(null);
  const [status, setStatus] = useState<Status>({ connected: false, login: null });
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedLayout, setCopiedLayout] = useState<OverlayLayout | null>(null);
  const [rolling, setRolling] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const twitchError = searchParams.get("twitch_error");
  const justConnected = searchParams.get("connected") === "1";

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/twitch/status");
    setStatus(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
    refreshStatus();
    const interval = setInterval(refreshStatus, 8000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  useEffect(() => {
    if (!status.connected) {
      setRewards([]);
      return;
    }
    fetch("/api/twitch/rewards")
      .then((r) => r.json())
      .then((body) => setRewards(body.rewards ?? []));
  }, [status.connected]);

  const patchSettings = (patch: Partial<OverlaySettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
    }, 400);
  };

  const handleDisconnect = async () => {
    await fetch("/api/twitch/disconnect", { method: "POST" });
    refreshStatus();
  };

  const handleRollAllThree = async () => {
    setRolling(true);
    await fetch("/api/roll", { method: "POST" });
    setTimeout(() => setRolling(false), 600);
  };

  const overlayUrl = (layout: OverlayLayout) =>
    typeof window !== "undefined" ? `${window.location.origin}/overlay/${layout}` : "";

  const handleCopy = async (layout: OverlayLayout) => {
    await navigator.clipboard.writeText(overlayUrl(layout));
    setCopiedLayout(layout);
    setTimeout(() => setCopiedLayout(null), 1500);
  };

  if (!settings) {
    return <div style={{ padding: 24, color: "var(--text-muted)" }}>loading…</div>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px 60px" }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          marginBottom: 6
        }}
      >
        OBS browser source · Twitch chat
      </div>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.15 }}>
        Bayou Roulette — loadout randomizer for Hunt: Showdown 1896
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 640, marginBottom: 20 }}>
        Rolls a legal hunter: two weapons against the 5-slot budget (6 with Quartermaster),{" "}
        {settings.maxTools} tools, {settings.maxConsumables} consumables and traits inside a{" "}
        {settings.traitPointCap}-point cap. Add it as a browser source in OBS; chat pulls the
        lever.
      </p>

      {twitchError && (
        <div style={bannerStyle("var(--danger)")}>Twitch connection failed: {twitchError}</div>
      )}
      {justConnected && !twitchError && (
        <div style={bannerStyle("var(--success)")}>Connected to twitch.tv/{status.login}</div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "12px 14px",
          marginBottom: 24
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: status.connected ? "var(--success)" : "var(--text-muted)"
          }}
        />
        <span style={{ fontSize: 13 }}>
          {status.connected ? `Connected · twitch.tv/${status.login}` : "Not connected"}
        </span>

        <Pill>{settings.chatCommand}</Pill>
        <Pill>{settings.chatCommand} reroll</Pill>
        <Pill>{settings.chatCommand} prev</Pill>
        <Pill>cooldown {settings.cooldownSec}s</Pill>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {status.connected ? (
            <button style={secondaryButtonStyle} onClick={handleDisconnect}>
              disconnect
            </button>
          ) : (
            <a href="/api/twitch/authorize" style={{ textDecoration: "none" }}>
              <button style={primaryButtonStyle}>connect twitch</button>
            </a>
          )}
          <button style={primaryButtonStyle} onClick={handleRollAllThree} disabled={rolling}>
            {rolling ? "rolling…" : "roll all three"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 28
        }}
      >
        <Field label="chat command">
          <input
            value={settings.chatCommand}
            onChange={(e) => patchSettings({ chatCommand: e.target.value })}
            style={inputStyle}
          />
        </Field>
        <Field label={`trait cap · ${settings.traitPointCap} pts`}>
          <input
            type="range"
            min={0}
            max={50}
            value={settings.traitPointCap}
            onChange={(e) => patchSettings({ traitPointCap: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </Field>
        <Field label="cooldown, s">
          <input
            type="number"
            min={0}
            value={settings.cooldownSec}
            onChange={(e) => patchSettings({ cooldownSec: Number(e.target.value) })}
            style={inputStyle}
          />
        </Field>
        <Field label="hide delay, s">
          <input
            type="number"
            min={1}
            value={settings.hideDelaySec}
            onChange={(e) => patchSettings({ hideDelaySec: Number(e.target.value) })}
            style={inputStyle}
          />
        </Field>
        <Field label="tools">
          <input
            type="number"
            min={0}
            max={4}
            value={settings.maxTools}
            onChange={(e) => patchSettings({ maxTools: Number(e.target.value) })}
            style={inputStyle}
          />
        </Field>
        <Field label="consumables">
          <input
            type="number"
            min={0}
            max={4}
            value={settings.maxConsumables}
            onChange={(e) => patchSettings({ maxConsumables: Number(e.target.value) })}
            style={inputStyle}
          />
        </Field>
        {status.connected && (
          <Field label="channel-point reward">
            <select
              value={settings.rewardId ?? ""}
              onChange={(e) => {
                const reward = rewards.find((r) => r.id === e.target.value) ?? null;
                patchSettings({
                  rewardId: reward?.id ?? null,
                  rewardTitle: reward?.title ?? null
                });
              }}
              style={inputStyle}
            >
              <option value="">none</option>
              {rewards.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 28
        }}
      >
        {LAYOUTS.map((layout) => (
          <div
            key={layout.id}
            data-testid={`layout-card-${layout.id}`}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "14px 16px"
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{layout.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              {layout.blurb}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={secondaryButtonStyle} onClick={() => handleCopy(layout.id)}>
                {copiedLayout === layout.id ? "copied" : "copy OBS url"}
              </button>
              <a href={`/overlay/${layout.id}?demo=1`} target="_blank" rel="noreferrer">
                <button style={secondaryButtonStyle}>preview</button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16
        }}
      >
        <InfoCard title="Setup" heading="OBS browser source">
          Add the overlay URL at 1920×1080, tick shutdown not visible, and the panel draws itself
          while a roll is live — {settings.hideDelaySec}s after it lands it fades out.
        </InfoCard>
        <InfoCard title="Chat" heading="Who can pull the lever">
          {settings.chatCommand} for anyone past the cooldown, {settings.chatCommand} reroll for
          mods and subs. {settings.chatCommand} prev shows the previous loadout again (repeat to
          go further back, up to 10). Channel-point redemptions map to the same handler.
        </InfoCard>
        <InfoCard title="Rules" heading="1896 legality">
          Weapon slots cost 1/2/3 against a 5-slot budget; a rolled Quartermaster buys a sixth
          slot, so large + large becomes legal. {settings.maxTools} tools cap,{" "}
          {settings.maxConsumables} consumables cap, traits capped at {settings.traitPointCap}{" "}
          upgrade points.
        </InfoCard>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>
      {label}
      <div style={{ marginTop: 4 }}>{children}</div>
    </label>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        color: "var(--accent-cyan)",
        border: "1px solid rgba(79,210,232,0.4)",
        background: "var(--accent-cyan-dim)",
        borderRadius: 999,
        padding: "3px 9px"
      }}
    >
      {children}
    </span>
  );
}

function InfoCard({
  title,
  heading,
  children
}: {
  title: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "14px 16px"
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          marginBottom: 6
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{heading}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

function bannerStyle(color: string): CSSProperties {
  return {
    border: `1px solid ${color}`,
    borderRadius: "var(--radius)",
    padding: "10px 14px",
    fontSize: 12,
    color,
    marginBottom: 16
  };
}

const inputStyle: CSSProperties = {
  width: "100%",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--text-primary)",
  padding: "8px 10px",
  fontSize: 13
};

const primaryButtonStyle: CSSProperties = {
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius)",
  padding: "8px 14px",
  background: "var(--surface-2)",
  color: "var(--text-primary)",
  fontSize: 12,
  fontWeight: 600
};

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
  background: "transparent",
  color: "var(--text-primary)",
  fontSize: 12
};
