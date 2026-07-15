export enum AlertSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info",
}

export enum AlertStatus {
  ACTIVE = "active",
  ACKNOWLEDGED = "acknowledged",
  RESOLVED = "resolved",
  SUPPRESSED = "suppressed",
}

export interface Alert {
  id: string;
  monitorId: string;
  userId: string;
  contractId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: string;
  txHash: string | null;
  blockNumber: number | null;
  data: Record<string, unknown>;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: AlertSeverity;
  actions: AlertAction[];
  isEnabled: boolean;
}

export enum AlertActionType {
  EMAIL = "email",
  WEBHOOK = "webhook",
  DISCORD = "discord",
  TELEGRAM = "telegram",
  SLACK = "slack",
  IN_APP = "in_app",
}

export interface AlertAction {
  type: AlertActionType;
  config: Record<string, unknown>;
  isEnabled: boolean;
}
