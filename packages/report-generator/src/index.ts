import { generateMarkdownReport, generateJsonReport } from "./formats";
import { ReportSection } from "@sentinelai/shared";
import type {
  AuditResult,
  Report,
  ReportFormat,
} from "@sentinelai/shared";

export class ReportGenerator {
  private templates: Map<string, string> = new Map();

  generateReport(audit: AuditResult, format: ReportFormat): Report {
    const reportId = `report_${audit.auditId}`;

    let content: string;
    switch (format) {
      case "markdown":
        content = generateMarkdownReport(audit);
        break;
      case "json":
        content = generateJsonReport(audit);
        break;
      default:
        content = generateMarkdownReport(audit);
    }

    return {
      id: reportId,
      auditId: audit.auditId,
      userId: "",
      contractId: audit.contractId,
      format,
      title: `Security Audit Report`,
      content,
      summary: audit.summary.overallRisk,
      hash: this.hashContent(content),
      ipfsHash: null,
      ipfsUri: null,
      txHash: null,
      generatedBy: "SentinelAI Report Generator v1.0.0",
      metadata: {
        generator: "SentinelAI",
        version: "1.0.0",
        auditType: "Smart Contract Security Audit",
        contractName: audit.contractId,
        contractAddress: null,
        securityScore: audit.securityScore,
        totalVulnerabilities: audit.summary.totalVulnerabilities,
        sections: Object.values(ReportSection),
        aiAssisted: audit.aiInsights !== null,
        onChainStored: false,
      },
      createdAt: new Date().toISOString(),
    };
  }

  registerTemplate(name: string, template: string): void {
    this.templates.set(name, template);
  }

  getTemplate(name: string): string | undefined {
    return this.templates.get(name);
  }

  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sha256_${Math.abs(hash).toString(16).padStart(40, "0")}`;
  }
}

export { ReportFormat } from "@sentinelai/shared";
export type { Report, AuditResult } from "@sentinelai/shared";
