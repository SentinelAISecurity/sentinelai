export interface Monitor {
  id: string;
  userId: string;
  contractId: string;
  name: string;
  description: string | null;
  chainId: string;
  contractAddress: string;
  isActive: boolean;
  checkInterval: number;
  rules: MonitorRule[];
  lastCheckedAt: string | null;
  totalAlerts: number;
  createdAt: string;
  updatedAt: string;
}

export enum MonitorRuleType {
  OWNERSHIP_TRANSFER = "ownership_transfer",
  PAUSE_UNPAUSE = "pause_unpause",
  PROXY_UPGRADE = "proxy_upgrade",
  TOKEN_MINT = "token_mint",
  LARGE_WITHDRAWAL = "large_withdrawal",
  SUSPICIOUS_TX_SPIKE = "suspicious_tx_spike",
  FUNCTION_CALL = "function_call",
  BALANCE_CHANGE = "balance_change",
  EVENT_EMISSION = "event_emission",
  CUSTOM = "custom",
}

export interface MonitorRule {
  id: string;
  type: MonitorRuleType;
  name: string;
  description: string;
  isEnabled: boolean;
  threshold: MonitorThreshold;
  targetAddresses: string[];
  targetFunctions: string[];
  targetEvents: string[];
  notificationChannels: string[];
  metadata: Record<string, unknown>;
}

export interface MonitorThreshold {
  minAmount: string | null;
  maxAmount: string | null;
  minFrequency: number | null;
  timeWindow: number;
  alertCooldown: number;
}

export interface MonitorEvent {
  id: string;
  monitorId: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  ruleType: MonitorRuleType;
  description: string;
  data: Record<string, unknown>;
}
