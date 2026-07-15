import { describe, it, expect } from "vitest";
import {
  SEVERITY_ORDER,
  compareSeverity,
  formatAddress,
  generateId,
  calculateSecurityScore,
  slugify,
  truncate,
} from "./index";

describe("SEVERITY_ORDER", () => {
  it("should contain all severity levels in correct order", () => {
    expect(SEVERITY_ORDER).toEqual(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", "GAS"]);
  });
});

describe("compareSeverity", () => {
  it("should return negative when a is more severe than b", () => {
    expect(compareSeverity("CRITICAL", "HIGH")).toBeLessThan(0);
    expect(compareSeverity("HIGH", "MEDIUM")).toBeLessThan(0);
    expect(compareSeverity("MEDIUM", "LOW")).toBeLessThan(0);
    expect(compareSeverity("LOW", "INFO")).toBeLessThan(0);
  });

  it("should return positive when a is less severe than b", () => {
    expect(compareSeverity("INFO", "CRITICAL")).toBeGreaterThan(0);
    expect(compareSeverity("LOW", "HIGH")).toBeGreaterThan(0);
  });

  it("should return 0 for equal severities", () => {
    expect(compareSeverity("CRITICAL", "CRITICAL")).toBe(0);
    expect(compareSeverity("MEDIUM", "MEDIUM")).toBe(0);
  });

  it("should treat unknown severity as less severe (positive return)", () => {
    expect(compareSeverity("UNKNOWN", "CRITICAL")).toBe(1);
  });

  it("should treat unknown severity in b as more severe (negative return)", () => {
    expect(compareSeverity("CRITICAL", "UNKNOWN")).toBe(-1);
  });
});

describe("formatAddress", () => {
  it("should format an Ethereum address with default 6 chars", () => {
    // chars=6: prefix = 0x + 6 chars = 8 chars, suffix = last 6 chars
    const result = formatAddress("0x1234567890abcdef1234567890abcdef12345678");
    expect(result).toBe("0x123456...345678");
  });

  it("should format with custom character count", () => {
    // chars=4: prefix = 0x + 4 chars = 6 chars, suffix = last 4 chars
    const result = formatAddress("0x1234567890abcdef1234567890abcdef12345678", 4);
    expect(result).toBe("0x1234...5678");
  });

  it("should return empty string for falsy address", () => {
    expect(formatAddress("")).toBe("");
    expect(formatAddress(null as unknown as string)).toBe("");
    expect(formatAddress(undefined as unknown as string)).toBe("");
  });
});

describe("generateId", () => {
  it("should generate a non-empty string", () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});

describe("calculateSecurityScore", () => {
  it("should return 100 for no vulnerabilities", () => {
    expect(calculateSecurityScore([])).toBe(100);
  });

  it("should deduct 25 per critical vulnerability", () => {
    const vulns = [
      { severity: "CRITICAL" },
      { severity: "CRITICAL" },
    ];
    expect(calculateSecurityScore(vulns)).toBe(50);
  });

  it("should deduct 15 per high vulnerability", () => {
    const vulns = [{ severity: "HIGH" }, { severity: "HIGH" }];
    expect(calculateSecurityScore(vulns)).toBe(70);
  });

  it("should deduct 8 per medium vulnerability", () => {
    const vulns = [{ severity: "MEDIUM" }, { severity: "MEDIUM" }, { severity: "MEDIUM" }];
    expect(calculateSecurityScore(vulns)).toBe(76);
  });

  it("should deduct 3 per low vulnerability", () => {
    const vulns = [{ severity: "LOW" }, { severity: "LOW" }];
    expect(calculateSecurityScore(vulns)).toBe(94);
  });

  it("should deduct 0 for info vulnerabilities", () => {
    const vulns = [{ severity: "INFO" }, { severity: "INFO" }, { severity: "INFO" }];
    expect(calculateSecurityScore(vulns)).toBe(100);
  });

  it("should deduct 1 for gas optimizations", () => {
    const vulns = [{ severity: "GAS" }, { severity: "GAS" }];
    expect(calculateSecurityScore(vulns)).toBe(98);
  });

  it("should not go below 0", () => {
    const vulns = Array(10).fill({ severity: "CRITICAL" });
    expect(calculateSecurityScore(vulns)).toBe(0);
  });

  it("should not go above 100", () => {
    expect(calculateSecurityScore([])).toBe(100);
  });

  it("should handle unknown severity gracefully", () => {
    const vulns = [{ severity: "WILDCARD" }];
    expect(calculateSecurityScore(vulns)).toBe(100);
  });

  it("should calculate mixed severities correctly", () => {
    const vulns = [
      { severity: "CRITICAL" },
      { severity: "HIGH" },
      { severity: "MEDIUM" },
      { severity: "LOW" },
    ];
    // 100 - 25 - 15 - 8 - 3 = 49
    expect(calculateSecurityScore(vulns)).toBe(49);
  });
});

describe("slugify", () => {
  it("should convert to lowercase and replace spaces with dashes", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("Hello@World!")).toBe("helloworld");
  });

  it("should replace underscores with dashes", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });

  it("should remove leading and trailing dashes", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("truncate", () => {
  it("should return the original text if shorter than maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("should return the original text if equal to maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("should truncate text longer than maxLength", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("should handle very short maxLength", () => {
    expect(truncate("hello", 4)).toBe("h...");
  });

  it("should handle empty string", () => {
    expect(truncate("", 10)).toBe("");
  });
});
