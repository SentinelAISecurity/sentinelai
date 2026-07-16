import { describe, it, expect, beforeEach } from "vitest";
import { ReportGenerator } from "./index";
import { ReportFormat } from "@sentinelai/shared";
import type { AuditResult } from "@sentinelai/shared";
import { Severity, VulnerabilityCategory } from "@sentinelai/shared";

function createAuditResult(overrides: Partial<AuditResult> = {}): AuditResult {
  return {
    auditId: "audit-001",
    contractId: "contract-001",
    securityScore: 72,
    vulnerabilities: [
      {
        id: "vuln-001",
        auditId: "audit-001",
        title: "Reentrancy in withdraw()",
        description: "The withdraw function is vulnerable to reentrancy attacks.",
        severity: Severity.CRITICAL,
        category: VulnerabilityCategory.REENTRANCY,
        lineNumbers: [45, 46, 47],
        fileName: "TokenVault.rs",
        functionName: "withdraw",
        vulnerableCode:
          'fn withdraw(env: Env, to: Address, amount: i128) {\n    to.require_auth();\n    token::transfer(&env, &to, &amount);\n} ',
        fixedCode:
          'fn withdraw(env: Env, to: Address, amount: i128) {\n    to.require_auth();\n    token::transfer(&env, &to, &amount);\n}',
        references: ["https://soroban.stellar.org/docs"],
        cvssScore: 9.8,
        exploitabilityScore: 9.0,
        confidence: 0.95,
        detectedBy: "reentrancy-scanner",
        detectedAt: "2024-01-15T10:30:00Z",
        metadata: {},
      },
      {
        id: "vuln-002",
        auditId: "audit-001",
        title: "Missing access control",
        description: "The mint function can be called by anyone.",
        severity: Severity.HIGH,
        category: VulnerabilityCategory.ACCESS_CONTROL,
        lineNumbers: [30],
        fileName: "TokenVault.rs",
        functionName: "mint",
        vulnerableCode: "fn mint(env: Env, to: Address, amount: i128) { ... }",
        fixedCode: "fn mint(env: Env, to: Address, amount: i128) { to.require_auth(); ... }",
        references: [],
        cvssScore: null,
        exploitabilityScore: 7.0,
        confidence: 0.9,
        detectedBy: "access-control-scanner",
        detectedAt: "2024-01-15T10:30:00Z",
        metadata: {},
      },
    ],
    summary: {
      totalVulnerabilities: 2,
      bySeverity: { CRITICAL: 1, HIGH: 1, MEDIUM: 0, LOW: 0, INFO: 0, GAS: 0 },
      securePatternsFound: ["Uses SafeMath-equivalent overflow protection"],
      overallRisk: "HIGH",
      estimatedExploitability: 0.85,
      remediationComplexity: "MODERATE",
    },
    recommendations: [
      {
        id: "rec-001",
        title: "Implement ReentrancyGuard",
        description: "Add OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks.",
        severity: "CRITICAL",
        category: "reentrancy",
        codeSnippet: 'use soroban_sdk::Address;',
        fixedCodeSnippet: null,
        references: ["https://soroban.stellar.org/docs"],
      },
      {
        id: "rec-002",
        title: "Add access control",
        description: "Restrict mint to onlyOwner.",
        severity: "HIGH",
        category: "access_control",
        codeSnippet: "require_auth",
        fixedCodeSnippet: "fn mint(env: Env, to: Address, amount: i128) { to.require_auth(); ... }",
        references: [],
      },
    ],
    gasAnalysis: {
      totalGasUsed: 45000,
      functions: [
        {
          name: "withdraw",
          gasUsed: 25000,
          visibility: "external",
          complexity: 3,
          suggestions: ["Use pull payment pattern"],
        },
      ],
      optimizations: [
        {
          title: "Pack state variables",
          description: "Pack uint256 variables together to save storage slots.",
          estimatedSavings: 20000,
          difficulty: "EASY",
        },
      ],
      overallGrade: "B",
    },
    aiInsights: {
      summary: {
        auditId: "audit-001",
        executiveSummary: "The TokenVault contract has 2 vulnerabilities including 1 critical reentrancy.",
        riskAssessment: "HIGH - Critical reentrancy could lead to complete fund loss.",
        keyFindings: ["Critical reentrancy", "Missing access control"],
        overallScore: 72,
        recommendations: ["Fix reentrancy first", "Add access control"],
      },
      vulnerabilityExplanations: [],
      fixSuggestions: [],
    },
    ...overrides,
  };
}

describe("ReportGenerator", () => {
  let generator: ReportGenerator;

  beforeEach(() => {
    generator = new ReportGenerator();
  });

  describe("generateReport", () => {
    it("should generate a Markdown report", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      expect(report.id).toBe("report_audit-001");
      expect(report.auditId).toBe("audit-001");
      expect(report.format).toBe(ReportFormat.MARKDOWN);
      expect(report.content).toContain("# 🔐 SentinelAI Security Audit Report");
      expect(report.content).toContain("Reentrancy in withdraw()");
      expect(report.content).toContain("Missing access control");
      expect(report.summary).toBe("HIGH");
    });

    it("should generate a JSON report", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.JSON);

      expect(report.format).toBe(ReportFormat.JSON);

      const parsed = JSON.parse(report.content);
      expect(parsed.reportType).toBe("SentinelAI Security Audit");
      expect(parsed.securityScore).toBe(72);
      expect(parsed.vulnerabilities).toHaveLength(2);
      expect(parsed.riskLevel).toBe("HIGH");
    });

    it("should default to Markdown for unknown formats", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, "pdf" as ReportFormat);

      expect(report.content).toContain("# 🔐 SentinelAI Security Audit Report");
    });

    it("should include statistics section", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      expect(report.content).toContain("2");
      expect(report.content).toContain("Critical");
      expect(report.content).toContain("High");
    });

    it("should include AI insights when available", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      expect(report.content).toContain("AI Insights");
      expect(report.content).toContain("Critical reentrancy could lead to complete fund loss");
    });

    it("should not include AI insights section when null", () => {
      const audit = createAuditResult({ aiInsights: null });
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      expect(report.content).not.toContain("AI Insights");
    });

    it("should handle empty vulnerabilities", () => {
      const audit = createAuditResult({
        vulnerabilities: [],
        summary: {
          ...createAuditResult().summary,
          totalVulnerabilities: 0,
          bySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0, GAS: 0 },
        },
      });
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      expect(report.content).toContain("✅ No vulnerabilities found");
      // AI Insights section may still reference vulnerability terms from the summary
      expect(report.content).not.toContain("### 🔴");
    });

    it("should include gas analysis section", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      expect(report.content).toContain("Gas Analysis");
      expect(report.content).toContain("Overall Grade");
      expect(report.content).toContain("Pack state variables");
    });

    it("should handle null gas analysis", () => {
      const audit = createAuditResult({ gasAnalysis: null as any });
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      // Should still have the Gas Analysis header but no content
      expect(report.content).toContain("Gas Analysis");
    });

    it("should include recommendations with fixed code", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.MARKDOWN);

      expect(report.content).toContain("Add access control");
      expect(report.content).toContain("```rust");
    });

    it("should set correct metadata", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.JSON);

      expect(report.metadata.generator).toBe("SentinelAI");
      expect(report.metadata.version).toBe("1.0.0");
      expect(report.metadata.securityScore).toBe(72);
      expect(report.metadata.totalVulnerabilities).toBe(2);
      expect(report.metadata.aiAssisted).toBe(true);
      expect(report.metadata.onChainStored).toBe(false);
    });

    it("should set aiAssisted to false when no AI insights", () => {
      const audit = createAuditResult({ aiInsights: null });
      const report = generator.generateReport(audit, ReportFormat.JSON);

      expect(report.metadata.aiAssisted).toBe(false);
    });

    it("should generate a non-empty hash", () => {
      const audit = createAuditResult();
      const report = generator.generateReport(audit, ReportFormat.JSON);

      expect(report.hash).toBeTruthy();
      expect(report.hash).toMatch(/^sha256_[a-f0-9]{40}$/);
    });

    it("should generate different hashes for different content", () => {
      const audit1 = createAuditResult();
      const audit2 = createAuditResult({
        securityScore: 99,
      });

      const report1 = generator.generateReport(audit1, ReportFormat.JSON);
      const report2 = generator.generateReport(audit2, ReportFormat.JSON);

      expect(report1.hash).not.toBe(report2.hash);
    });
  });

  describe("registerTemplate / getTemplate", () => {
    it("should register and retrieve templates", () => {
      generator.registerTemplate("custom", "# Custom Report");
      expect(generator.getTemplate("custom")).toBe("# Custom Report");
    });

    it("should return undefined for unregistered templates", () => {
      expect(generator.getTemplate("nonexistent")).toBeUndefined();
    });

    it("should overwrite existing templates", () => {
      generator.registerTemplate("test", "version 1");
      generator.registerTemplate("test", "version 2");
      expect(generator.getTemplate("test")).toBe("version 2");
    });
  });
});
