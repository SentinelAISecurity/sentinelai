import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIEngine } from "./index";
import { AIProvider, Severity, VulnerabilityCategory } from "@sentinelai/shared";
import type { Vulnerability } from "@sentinelai/shared";

function createMockVulnerability(overrides: Partial<Vulnerability> = {}): Vulnerability {
  return {
    id: "vuln-001",
    auditId: "audit-001",
    title: "Reentrancy in withdraw()",
    description: "The withdraw function sends ETH before updating the balance, enabling reentrancy.",
    severity: Severity.CRITICAL,
    category: VulnerabilityCategory.REENTRANCY,
    lineNumbers: [45, 46, 47],
    fileName: "TokenVault.rs",
    functionName: "withdraw",
    vulnerableCode:
      'fn withdraw(env: Env, to: Address, amount: i128) {\n    to.require_auth();\n    token::transfer(&env, &to, &amount);\n}',
    fixedCode:
      'fn withdraw(env: Env, to: Address, amount: i128) {\n    to.require_auth();\n    token::transfer(&env, &to, &amount);\n}',
    references: ["https://soroban.stellar.org/docs"],
    cvssScore: 9.8,
    exploitabilityScore: 9.0,
    confidence: 0.95,
    detectedBy: "reentrancy-scanner",
    detectedAt: "2024-01-01T00:00:00Z",
    metadata: {},
    ...overrides,
  };
}

// Mock AI response helper
function mockFetchResponse(content: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => "Error",
    json: async () => ({
      model: "test-model",
      choices: [{ message: { content }, finish_reason: "stop" }],
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
    }),
  };
}

describe("AIEngine", () => {
  let engine: AIEngine;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    engine = new AIEngine({
      apiKey: "test-key",
      model: "test-model",
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default config", () => {
      const defaultEngine = new AIEngine();
      const config = defaultEngine.getConfig();
      expect(config.model).toBe("gpt-4-turbo-preview");
      expect(config.maxTokens).toBe(4096);
      expect(config.temperature).toBe(0.3);
    });

    it("should override defaults with provided config", () => {
      const customEngine = new AIEngine({
        model: "custom-model",
        temperature: 0.7,
        apiKey: "custom-key",
      });
      const config = customEngine.getConfig();
      expect(config.model).toBe("custom-model");
      expect(config.temperature).toBe(0.7);
      expect(config.apiKey).toBe("custom-key");
    });
  });

  describe("getConfig", () => {
    it("should return a copy of the config", () => {
      const config = engine.getConfig();
      config.model = "modified";
      expect(engine.getConfig().model).toBe("test-model");
    });
  });

  describe("updateConfig", () => {
    it("should update config properties", () => {
      engine.updateConfig({ temperature: 0.8 });
      expect(engine.getConfig().temperature).toBe(0.8);
    });

    it("should update provider when changed", () => {
      engine.updateConfig({ provider: AIProvider.LLAMA });
      expect(engine.getConfig().provider).toBe(AIProvider.LLAMA);
    });
  });

  describe("buildPrompt templates", () => {
    it("should create valid prompts for all built-in templates", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse("OK"));

      const vuln = createMockVulnerability();

      await expect(engine.explainVulnerability(vuln)).resolves.toBeDefined();
      await expect(engine.suggestFix(vuln)).resolves.toBeDefined();
      await expect(engine.generateSummary([vuln], "TestContract")).resolves.toBeDefined();
      await expect(engine.chat("hello")).resolves.toBeDefined();
    });
  });

  describe("extractSection / extractList (via AI responses)", () => {
    it("should extract sections from AI response in explainVulnerability", async () => {
      const mockContent = `PLAIN_ENGLISH:
This vulnerability allows attackers to drain the contract by calling withdraw repeatedly before the balance is updated.

EXPLOIT_SCENARIO:
An attacker deploys a malicious contract that recursively calls withdraw().

IMPACT:
Complete loss of all funds in the contract.

REMEDIATION:
Move the state update before the external call and use ReentrancyGuard.

SECURE_EXAMPLE:
function withdraw() external nonReentrant { ... }`;

      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse(mockContent));

      const vuln = createMockVulnerability();
      const result = await engine.explainVulnerability(vuln);

      expect(result.vulnerabilityId).toBe("vuln-001");
      expect(result.title).toBe("Reentrancy in withdraw()");
      expect(result.plainEnglish).toContain("attackers to drain the contract");
      expect(result.exploitScenario).toContain("malicious contract");
      expect(result.impact).toContain("Complete loss");
      expect(result.remediation).toContain("state update");
      expect(result.secureExample).toContain("nonReentrant");
      expect(result.confidence).toBe(0.9);
    });

    it("should fall back to full content if section extraction fails", async () => {
      const mockContent = "This is a simple explanation without section headers.";

      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse(mockContent));

      const vuln = createMockVulnerability();
      const result = await engine.explainVulnerability(vuln);

      expect(result.plainEnglish).toBe(mockContent);
      expect(result.exploitScenario).toBe("");
      expect(result.impact).toBe("");
    });
  });

  describe("suggestFix", () => {
    it("should extract fix sections from AI response", async () => {
      const mockContent = `FIXED_CODE:
function withdraw() external nonReentrant {
    uint256 amount = balance;
    balance = 0;
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok);
}

EXPLANATION:
Added the nonReentrant modifier and moved the state update before the external call, following the Checks-Effects-Interactions pattern.

TRADEOFFS:
- Slightly higher gas cost due to the mutex check
- Requires importing OpenZeppelin's ReentrancyGuard

BEST_PRACTICES:
- Always follow Checks-Effects-Interactions pattern
- Use established libraries for security features`;

      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse(mockContent));

      const vuln = createMockVulnerability();
      const result = await engine.suggestFix(vuln);

      expect(result.vulnerabilityId).toBe("vuln-001");
      expect(result.originalCode).toBe(vuln.vulnerableCode);
      expect(result.fixedCode).toContain("nonReentrant");
      expect(result.explanation).toContain("nonReentrant");
      expect(result.tradeoffs.length).toBeGreaterThanOrEqual(1);
      expect(result.bestPractices.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("generateSummary", () => {
    it("should generate a summary from multiple vulnerabilities", async () => {
      const mockContent = `EXECUTIVE_SUMMARY:
The audit of TestContract found 3 vulnerabilities, including 1 critical reentrancy issue.

RISK_ASSESSMENT:
HIGH - The critical reentrancy vulnerability could lead to complete fund loss.

KEY_FINDINGS:
- Critical reentrancy in withdraw()
- Missing access control on admin functions
- Unused variables in constructor

OVERALL_SCORE:
65

RECOMMENDATIONS:
- Fix the critical reentrancy before deployment
- Add comprehensive access control
- Consider a professional audit`;

      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse(mockContent));

      const vulns = [
        createMockVulnerability({ severity: Severity.CRITICAL }),
        createMockVulnerability({
          id: "vuln-002",
          severity: Severity.HIGH,
          title: "Missing access control",
          category: VulnerabilityCategory.ACCESS_CONTROL,
        }),
        createMockVulnerability({
          id: "vuln-003",
          severity: Severity.LOW,
          title: "Unused variable",
          category: VulnerabilityCategory.GAS,
        }),
      ];

      const result = await engine.generateSummary(vulns, "TestContract");

      expect(result.executiveSummary).toContain("3 vulnerabilities");
      expect(result.riskAssessment).toContain("HIGH");
      expect(result.keyFindings.length).toBeGreaterThanOrEqual(1);
      expect(result.keyFindings[0]).toContain("reentrancy");
      expect(result.overallScore).toBe(65);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle non-numeric score gracefully", async () => {
      const mockContent = `EXECUTIVE_SUMMARY:
Results.

OVERALL_SCORE:
not-a-number`;

      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse(mockContent));

      const result = await engine.generateSummary([], "Test");
      expect(result.overallScore).toBe(0);
    });
  });

  describe("chat", () => {
    it("should return the AI response content", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse("I recommend using OpenZeppelin's ReentrancyGuard."));

      const reply = await engine.chat("How do I prevent reentrancy?", "contract withdraw() external { ... }");

      expect(reply).toContain("ReentrancyGuard");
    });
  });

  describe("error handling", () => {
    it("should throw when API returns non-OK status", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(mockFetchResponse("Unauthorized", 401));

      const vuln = createMockVulnerability();
      await expect(engine.explainVulnerability(vuln)).rejects.toThrow("AI call failed");
    });

    it("should throw when fetch itself fails", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const vuln = createMockVulnerability();
      await expect(engine.explainVulnerability(vuln)).rejects.toThrow("AI call failed");
    });
  });
});
