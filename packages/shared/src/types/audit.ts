import type { Vulnerability } from "./vulnerability";
import type { AIInsights } from "./ai";

// Audits
export enum AuditStatus {
  PENDING = "pending",
  SCANNING = "scanning",
  ANALYZING = "analyzing",
  COMPLETED = "completed",
  FAILED = "failed",
  ARCHIVED = "archived",
}

export enum AuditType {
  FILE_UPLOAD = "file_upload",
  PASTE_SOURCE = "paste_source",
  GITHUB_REPO = "github_repo",
  CONTRACT_ADDRESS = "contract_address",
  MONITORED = "monitored",
}

export interface Audit {
  id: string;
  userId: string;
  contractId: string;
  type: AuditType;
  status: AuditStatus;
  securityScore: number;
  vulnerabilitiesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  gasScore: number;
  duration: number;
  sourceHash: string;
  reportHash: string | null;
  reportUri: string | null;
  txHash: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface AuditCreateRequest {
  contractId: string;
  type: AuditType;
  sourceCode?: string;
  githubUrl?: string;
  contractAddress?: string;
  chainId?: string;
  options?: {
    deepScan?: boolean;
    aiAnalysis?: boolean;
    generateReport?: boolean;
    storeOnChain?: boolean;
  };
}

export interface AuditResult {
  auditId: string;
  contractId: string;
  securityScore: number;
  vulnerabilities: Vulnerability[];
  summary: AuditSummary;
  recommendations: Recommendation[];
  gasAnalysis: GasAnalysis;
  aiInsights: AIInsights | null;
}

export interface AuditSummary {
  totalVulnerabilities: number;
  bySeverity: Record<string, number>;
  securePatternsFound: string[];
  overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  estimatedExploitability: number;
  remediationComplexity: "SIMPLE" | "MODERATE" | "COMPLEX";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  codeSnippet: string | null;
  fixedCodeSnippet: string | null;
  references: string[];
}

export interface GasAnalysis {
  totalGasUsed: number;
  functions: GasFunctionAnalysis[];
  optimizations: GasOptimization[];
  overallGrade: "A" | "B" | "C" | "D" | "F";
}

export interface GasFunctionAnalysis {
  name: string;
  gasUsed: number;
  visibility: string;
  complexity: number;
  suggestions: string[];
}

export interface GasOptimization {
  title: string;
  description: string;
  estimatedSavings: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}
