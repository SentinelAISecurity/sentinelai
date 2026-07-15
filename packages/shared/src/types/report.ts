export interface Report {
  id: string;
  auditId: string;
  userId: string;
  contractId: string;
  format: ReportFormat;
  title: string;
  content: string;
  summary: string;
  hash: string;
  ipfsHash: string | null;
  ipfsUri: string | null;
  txHash: string | null;
  generatedBy: string;
  metadata: ReportMetadata;
  createdAt: string;
}

export enum ReportFormat {
  MARKDOWN = "markdown",
  JSON = "json",
  PDF = "pdf",
  HTML = "html",
}

export enum ReportSection {
  EXECUTIVE_SUMMARY = "executive_summary",
  VULNERABILITY_DETAILS = "vulnerability_details",
  GAS_ANALYSIS = "gas_analysis",
  RECOMMENDATIONS = "recommendations",
  CODE_COVERAGE = "code_coverage",
  APPENDIX = "appendix",
  AI_INSIGHTS = "ai_insights",
  AUDIT_METADATA = "audit_metadata",
}

export interface ReportMetadata {
  generator: string;
  version: string;
  auditType: string;
  contractName: string;
  contractAddress: string | null;
  securityScore: number;
  totalVulnerabilities: number;
  sections: ReportSection[];
  aiAssisted: boolean;
  onChainStored: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  format: ReportFormat;
  sections: ReportSection[];
  styling: Record<string, unknown>;
  customCSS: string | null;
}
