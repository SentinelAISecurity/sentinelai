import { Severity } from "../types/vulnerability";

export const SEVERITY_COLORS: Record<Severity, string> = {
  [Severity.CRITICAL]: "#DC2626",
  [Severity.HIGH]: "#EA580C",
  [Severity.MEDIUM]: "#CA8A04",
  [Severity.LOW]: "#2563EB",
  [Severity.INFO]: "#6B7280",
  [Severity.GAS]: "#9333EA",
};

export const SEVERITY_BG_COLORS: Record<Severity, string> = {
  [Severity.CRITICAL]: "bg-red-600",
  [Severity.HIGH]: "bg-orange-600",
  [Severity.MEDIUM]: "bg-yellow-600",
  [Severity.LOW]: "bg-blue-600",
  [Severity.INFO]: "bg-gray-600",
  [Severity.GAS]: "bg-purple-600",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  [Severity.CRITICAL]: "Critical",
  [Severity.HIGH]: "High",
  [Severity.MEDIUM]: "Medium",
  [Severity.LOW]: "Low",
  [Severity.INFO]: "Info",
  [Severity.GAS]: "Gas",
};

export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const PLUGIN_TIMEOUT_MS = 30_000;
export const MAX_SOURCE_CODE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const RATE_LIMIT = {
  AUDIT_CREATE: { windowMs: 60_000, max: 5 },
  AUDIT_RUN: { windowMs: 60_000, max: 10 },
  AI_REQUEST: { windowMs: 60_000, max: 30 },
  AUTH_CHALLENGE: { windowMs: 60_000, max: 10 },
  GENERAL: { windowMs: 60_000, max: 100 },
};

export const JWT_EXPIRY = "24h";
export const REFRESH_TOKEN_EXPIRY = "7d";
export const NONCE_EXPIRY_SECONDS = 300;
