export interface DashboardStats {
  totalAudits: number;
  totalContracts: number;
  activeMonitors: number;
  totalVulnerabilities: number;
  securityScore: number;
  averageAuditTime: number;
  criticalResolved: number;
  highResolved: number;
}

export interface DashboardData {
  stats: DashboardStats;
  severityDistribution: SeverityDistribution;
  vulnerabilityTimeline: TimelineDataPoint[];
  recentAudits: import("./audit").Audit[];
  recentAlerts: import("./alert").Alert[];
  topVulnerabilities: TopVulnerability[];
  contractHealth: ContractHealth[];
  activityFeed: ActivityItem[];
}

export interface SeverityDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  gas: number;
}

export interface TimelineDataPoint {
  date: string;
  audits: number;
  vulnerabilities: number;
  fixed: number;
}

export interface TopVulnerability {
  category: string;
  count: number;
  severity: string;
  trend: "UP" | "DOWN" | "STABLE";
}

export interface ContractHealth {
  contractId: string;
  name: string;
  address: string | null;
  securityScore: number;
  vulnerabilitiesOpen: number;
  lastAuditedAt: string | null;
  status: string;
}

export interface ActivityItem {
  id: string;
  type: "AUDIT" | "ALERT" | "MONITOR" | "CONTRACT" | "USER";
  title: string;
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}
