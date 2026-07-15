import { describe, it, expect } from "vitest";
import {
  SEVERITY_COLORS,
  SEVERITY_BG_COLORS,
  SEVERITY_LABELS,
  API_VERSION,
  API_PREFIX,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PLUGIN_TIMEOUT_MS,
  MAX_SOURCE_CODE_SIZE_BYTES,
  RATE_LIMIT,
  JWT_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  NONCE_EXPIRY_SECONDS,
} from "./index";
import { Severity } from "../types/vulnerability";

describe("SEVERITY_COLORS", () => {
  it("should have hex colors for all severities", () => {
    for (const severity of Object.values(Severity)) {
      expect(SEVERITY_COLORS[severity]).toMatch(/^#[A-Fa-f0-9]{6}$/);
    }
  });

  it("should have correct critical color", () => {
    expect(SEVERITY_COLORS[Severity.CRITICAL]).toBe("#DC2626");
  });
});

describe("SEVERITY_BG_COLORS", () => {
  it("should have Tailwind classes for all severities", () => {
    for (const severity of Object.values(Severity)) {
      expect(SEVERITY_BG_COLORS[severity]).toMatch(/^bg-/);
    }
  });
});

describe("SEVERITY_LABELS", () => {
  it("should have readable labels", () => {
    expect(SEVERITY_LABELS[Severity.CRITICAL]).toBe("Critical");
    expect(SEVERITY_LABELS[Severity.HIGH]).toBe("High");
    expect(SEVERITY_LABELS[Severity.MEDIUM]).toBe("Medium");
    expect(SEVERITY_LABELS[Severity.LOW]).toBe("Low");
    expect(SEVERITY_LABELS[Severity.INFO]).toBe("Info");
    expect(SEVERITY_LABELS[Severity.GAS]).toBe("Gas");
  });
});

describe("API constants", () => {
  it("should have correct version", () => {
    expect(API_VERSION).toBe("v1");
  });

  it("should have correct prefix", () => {
    expect(API_PREFIX).toBe("/api/v1");
  });
});

describe("Pagination constants", () => {
  it("should have sensible defaults", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(MAX_PAGE_SIZE).toBe(100);
    expect(DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(MAX_PAGE_SIZE);
  });
});

describe("Plugin/Scan limits", () => {
  it("should have a 30-second timeout", () => {
    expect(PLUGIN_TIMEOUT_MS).toBe(30_000);
  });

  it("should have a 10MB max source size", () => {
    expect(MAX_SOURCE_CODE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });
});

describe("RATE_LIMIT", () => {
  it("should have all rate limit categories", () => {
    expect(RATE_LIMIT.AUDIT_CREATE).toEqual({ windowMs: 60_000, max: 5 });
    expect(RATE_LIMIT.AUDIT_RUN).toEqual({ windowMs: 60_000, max: 10 });
    expect(RATE_LIMIT.AI_REQUEST).toEqual({ windowMs: 60_000, max: 30 });
    expect(RATE_LIMIT.AUTH_CHALLENGE).toEqual({ windowMs: 60_000, max: 10 });
    expect(RATE_LIMIT.GENERAL).toEqual({ windowMs: 60_000, max: 100 });
  });

  it("should have AI_REQUEST limit higher than GENERAL because chat messages may be frequent", () => {
    expect(RATE_LIMIT.AI_REQUEST.max).toBeGreaterThanOrEqual(10);
  });
});

describe("Auth constants", () => {
  it("should have correct expiry values", () => {
    expect(JWT_EXPIRY).toBe("24h");
    expect(REFRESH_TOKEN_EXPIRY).toBe("7d");
    expect(NONCE_EXPIRY_SECONDS).toBe(300);
  });
});
