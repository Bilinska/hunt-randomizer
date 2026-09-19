import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { OverlaySettings } from "../types";

const DATA_DIR = path.join(process.cwd(), ".data");
const TOKEN_PATH = path.join(DATA_DIR, "twitch-token.json");
const SETTINGS_PATH = path.join(DATA_DIR, "overlay-settings.json");

export interface TwitchToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  userId: string;
  login: string;
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function writeJson(filePath: string, data: unknown) {
  ensureDataDir();
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function readToken(): TwitchToken | null {
  return readJson<TwitchToken>(TOKEN_PATH);
}

export function writeToken(token: TwitchToken) {
  writeJson(TOKEN_PATH, token);
}

export function clearToken() {
  writeJson(TOKEN_PATH, null);
}

export const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  channel: null,
  chatCommand: "!loadout",
  cooldownSec: 90,
  hideDelaySec: 25,
  traitPointCap: 8,
  maxTools: 4,
  maxConsumables: 4,
  bannedItemIds: [],
  rewardId: null,
  rewardTitle: null,
  layout: "dossier"
};

export function readSettings(): OverlaySettings {
  const saved = readJson<Partial<OverlaySettings>>(SETTINGS_PATH);
  return { ...DEFAULT_OVERLAY_SETTINGS, ...(saved ?? {}) };
}

export function writeSettings(settings: OverlaySettings) {
  writeJson(SETTINGS_PATH, settings);
}
