import type {
  Monitor as MonitorConfig,
  MonitorRule,
  MonitorRuleType,
  MonitorEvent,
  Alert,
} from "@sentinelai/shared";
import { AlertSeverity, AlertStatus } from "@sentinelai/shared";

/*───────────────────────────────────────────────────────────────────
  Horizon API Types
───────────────────────────────────────────────────────────────────*/

interface HorizonAccountResponse {
  id: string;
  sequence: string;
  balances: Array<{ asset_type: string; balance: string; asset_code?: string; asset_issuer?: string }>;
  subentry_count: number;
  last_modified_ledger: number;
}

interface HorizonOperationRecord {
  id: string;
  type: string;
  type_i: number;
  transaction_hash: string;
  created_at: string;
  source_account?: string;
  amount?: string;
  from?: string;
  to?: string;
  asset_type?: string;
  asset_code?: string;
  funder?: string;
  account?: string;
  starting_balance?: string;
  signer_key?: string;
  signer_weight?: number;
  function?: string;
  parameters?: Array<{ type: string; value: unknown }>;
}

interface HorizonOperationsResponse {
  _embedded: { records: HorizonOperationRecord[] };
  _links: { next?: { href: string }; self: { href: string } };
}

interface HorizonTransactionRecord {
  id: string;
  hash: string;
  created_at: string;
  source_account: string;
  ledger: number;
  successful: boolean;
  fee_charged: string;
  operation_count: number;
}

interface HorizonTransactionsResponse {
  _embedded: { records: HorizonTransactionRecord[] };
  _links: { next?: { href: string }; self: { href: string } };
}

/*───────────────────────────────────────────────────────────────────
  StellarHorizonClient
───────────────────────────────────────────────────────────────────*/

class StellarHorizonClient {
  constructor(private horizonUrl: string) {}

  async fetchAccount(address: string): Promise<HorizonAccountResponse> {
    const url = `${this.horizonUrl}/accounts/${address}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Horizon error (${res.status}): ${await res.text()}`);
    }
    return res.json() as Promise<HorizonAccountResponse>;
  }

  async fetchOperations(
    address: string,
    opts: {
      limit?: number;
      cursor?: string;
      order?: "asc" | "desc";
      includeFailed?: boolean;
    } = {},
  ): Promise<HorizonOperationRecord[]> {
    const params = new URLSearchParams();
    params.set("limit", String(opts.limit ?? 50));
    params.set("order", opts.order ?? "desc");
    if (opts.cursor) params.set("cursor", opts.cursor);
    if (opts.includeFailed) params.set("include_failed", "true");

    const url = `${this.horizonUrl}/accounts/${address}/operations?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Horizon error (${res.status}): ${await res.text()}`);
    }
    const body = await res.json() as HorizonOperationsResponse;
    return body._embedded.records;
  }

  async fetchTransactions(
    address: string,
    opts: { limit?: number; cursor?: string; order?: "asc" | "desc" } = {},
  ): Promise<HorizonTransactionRecord[]> {
    const params = new URLSearchParams();
    params.set("limit", String(opts.limit ?? 50));
    params.set("order", opts.order ?? "desc");
    if (opts.cursor) params.set("cursor", opts.cursor);

    const url = `${this.horizonUrl}/accounts/${address}/transactions?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Horizon error (${res.status}): ${await res.text()}`);
    }
    const body = await res.json() as HorizonTransactionsResponse;
    return body._embedded.records;
  }

  async fetchOperationsSince(
    address: string,
    sinceIso: string,
    limit = 50,
  ): Promise<HorizonOperationRecord[]> {
    let allOps: HorizonOperationRecord[] = [];
    let cursor: string | undefined;

    while (allOps.length < limit) {
      const ops = await this.fetchOperations(address, {
        limit: 50,
        order: "desc",
        cursor,
      });

      if (ops.length === 0) break;

      const filtered = ops.filter((op) => op.created_at >= sinceIso);
      if (filtered.length < ops.length) {
        allOps.push(...filtered);
        break;
      }

      allOps.push(...filtered);
      cursor = ops[ops.length - 1]?.id;
    }

    return allOps.slice(0, limit);
  }
}

/*───────────────────────────────────────────────────────────────────
  Rule Evaluators
───────────────────────────────────────────────────────────────────*/

async function evaluateOwnershipTransfer(
  client: StellarHorizonClient,
  monitor: MonitorConfig,
  rule: MonitorRule,
  sinceIso: string,
): Promise<MonitorEvent[]> {
  const events: MonitorEvent[] = [];
  const ops = await client.fetchOperationsSince(monitor.contractAddress, sinceIso, 50);

  // Detect set_options ops that change signers (ownership pattern on Stellar)
  const signerChanges = ops.filter(
    (op) =>
      op.type === "set_options" &&
      (op.signer_key || op.signer_weight !== undefined),
  );

  for (const op of signerChanges) {
    const isTargeted = rule.targetAddresses.length === 0 || rule.targetAddresses.includes(
      op.signer_key ?? "",
    );

    if (isTargeted) {
      events.push({
        id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        monitorId: monitor.id,
        txHash: op.transaction_hash,
        blockNumber: 0,
        timestamp: op.created_at,
        ruleType: rule.type,
        description: `Signer change detected: ${op.signer_key ?? "unknown"} (weight: ${op.signer_weight ?? "N/A"})`,
        data: {
          monitorName: monitor.name,
          ruleName: rule.name,
          contractAddress: monitor.contractAddress,
          signerKey: op.signer_key,
          signerWeight: op.signer_weight,
          txHash: op.transaction_hash,
        },
      });
    }
  }

  return events;
}

async function evaluateLargeWithdrawal(
  client: StellarHorizonClient,
  monitor: MonitorConfig,
  rule: MonitorRule,
  sinceIso: string,
): Promise<MonitorEvent[]> {
  const events: MonitorEvent[] = [];
  const threshold = rule.threshold.minAmount ? parseFloat(rule.threshold.minAmount) : 0;
  if (threshold <= 0) return events;

  const ops = await client.fetchOperationsSince(monitor.contractAddress, sinceIso, 50);

  // Detect payment operations that send funds FROM the monitored contract
  const payments = ops.filter(
    (op) =>
      (op.type === "payment" || op.type === "path_payment_strict_send" || op.type === "path_payment_strict_receive") &&
      op.from === monitor.contractAddress &&
      op.amount,
  );

  for (const op of payments) {
    const amount = parseFloat(op.amount ?? "0");
    const isTargeted = rule.targetAddresses.length === 0 || rule.targetAddresses.includes(op.to ?? "");

    if (amount > threshold && isTargeted) {
      events.push({
        id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        monitorId: monitor.id,
        txHash: op.transaction_hash,
        blockNumber: 0,
        timestamp: op.created_at,
        ruleType: rule.type,
        description: `Large withdrawal: ${amount} ${op.asset_code ?? "XLM"} to ${op.to}`,
        data: {
          monitorName: monitor.name,
          ruleName: rule.name,
          contractAddress: monitor.contractAddress,
          amount,
          asset: op.asset_code ?? "XLM",
          to: op.to,
          txHash: op.transaction_hash,
        },
      });
    }
  }

  return events;
}

async function evaluateSuspiciousTxSpike(
  client: StellarHorizonClient,
  monitor: MonitorConfig,
  rule: MonitorRule,
  sinceIso: string,
): Promise<MonitorEvent[]> {
  const events: MonitorEvent[] = [];
  const minFrequency = rule.threshold.minFrequency ?? 10;
  const timeWindowSec = rule.threshold.timeWindow || 300;

  const ops = await client.fetchOperationsSince(monitor.contractAddress, sinceIso, 200);
  const windowStart = new Date(Date.now() - timeWindowSec * 1000).toISOString();

  const recentOps = ops.filter((op) => op.created_at >= windowStart);

  if (recentOps.length > minFrequency) {
    events.push({
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      monitorId: monitor.id,
      txHash: recentOps[0]?.transaction_hash ?? "",
      blockNumber: 0,
      timestamp: new Date().toISOString(),
      ruleType: rule.type,
      description: `Transaction spike detected: ${recentOps.length} operations in ${timeWindowSec}s (threshold: ${minFrequency})`,
      data: {
        monitorName: monitor.name,
        ruleName: rule.name,
        contractAddress: monitor.contractAddress,
        operationCount: recentOps.length,
        timeWindowSec,
        threshold: minFrequency,
      },
    });
  }

  return events;
}

async function evaluateFunctionCall(
  client: StellarHorizonClient,
  monitor: MonitorConfig,
  rule: MonitorRule,
  sinceIso: string,
): Promise<MonitorEvent[]> {
  const events: MonitorEvent[] = [];
  const ops = await client.fetchOperationsSince(monitor.contractAddress, sinceIso, 50);

  // Filter for invoke_host_function ops (Soroban contract calls)
  const contractCalls = ops.filter(
    (op) =>
      op.type === "invoke_host_function" &&
      (rule.targetFunctions.length === 0 || (op.function && rule.targetFunctions.includes(op.function))),
  );

  for (const op of contractCalls) {
    events.push({
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      monitorId: monitor.id,
      txHash: op.transaction_hash,
      blockNumber: 0,
      timestamp: op.created_at,
      ruleType: rule.type,
      description: `Contract function called: ${op.function ?? "unknown"} on ${monitor.contractAddress}`,
      data: {
        monitorName: monitor.name,
        ruleName: rule.name,
        contractAddress: monitor.contractAddress,
        function: op.function,
        parameters: op.parameters,
        txHash: op.transaction_hash,
      },
    });
  }

  return events;
}

async function evaluateBalanceChange(
  client: StellarHorizonClient,
  monitor: MonitorConfig,
  rule: MonitorRule,
): Promise<MonitorEvent[]> {
  const events: MonitorEvent[] = [];
  const threshold = rule.threshold.minAmount ? parseFloat(rule.threshold.minAmount) : 0;

  if (threshold <= 0) return events;

  try {
    const account = await client.fetchAccount(monitor.contractAddress);

    for (const balance of account.balances) {
      const amount = parseFloat(balance.balance);
      const asset = balance.asset_code ?? "XLM";

      if (amount > threshold) {
        events.push({
          id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          monitorId: monitor.id,
          txHash: "",
          blockNumber: account.last_modified_ledger,
          timestamp: new Date().toISOString(),
          ruleType: rule.type,
          description: `High balance detected: ${amount} ${asset} on ${monitor.contractAddress}`,
          data: {
            monitorName: monitor.name,
            ruleName: rule.name,
            contractAddress: monitor.contractAddress,
            balance: amount,
            asset,
            ledger: account.last_modified_ledger,
          },
        });
      }
    }
  } catch {
    // Account not found or unreachable — skip
  }

  return events;
}

async function evaluateEventEmission(
  client: StellarHorizonClient,
  monitor: MonitorConfig,
  rule: MonitorRule,
  sinceIso: string,
): Promise<MonitorEvent[]> {
  const events: MonitorEvent[] = [];
  const ops = await client.fetchOperationsSince(monitor.contractAddress, sinceIso, 50);

  // Look for invoke_host_function ops that match target events
  const matchingOps = ops.filter(
    (op) =>
      op.type === "invoke_host_function" &&
      (rule.targetEvents.length === 0 || (op.function && rule.targetEvents.includes(op.function))),
  );

  for (const op of matchingOps) {
    events.push({
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      monitorId: monitor.id,
      txHash: op.transaction_hash,
      blockNumber: 0,
      timestamp: op.created_at,
      ruleType: rule.type,
      description: `Event emitted: ${op.function ?? "unknown"} on ${monitor.contractAddress}`,
      data: {
        monitorName: monitor.name,
        ruleName: rule.name,
        contractAddress: monitor.contractAddress,
        event: op.function,
        txHash: op.transaction_hash,
      },
    });
  }

  return events;
}

async function evaluateCustomRule(
  _client: StellarHorizonClient,
  monitor: MonitorConfig,
  rule: MonitorRule,
): Promise<MonitorEvent[]> {
  // Custom rules are user-defined and require specific logic
  // Delegate to metadata-defined handlers if present
  if (rule.metadata?.handler && typeof rule.metadata.handler === "function") {
    try {
      return await (rule.metadata.handler as Function)(monitor, rule);
    } catch {
      return [];
    }
  }
  return [];
}

/*───────────────────────────────────────────────────────────────────
  ContractMonitor
───────────────────────────────────────────────────────────────────*/

export class ContractMonitor {
  private monitors: Map<string, MonitorConfig> = new Map();
  private events: MonitorEvent[] = [];
  private alerts: Alert[] = [];
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private horizonClient: StellarHorizonClient;

  constructor(horizonUrl = "https://horizon.stellar.org") {
    this.horizonClient = new StellarHorizonClient(horizonUrl);
  }

  async addMonitor(config: MonitorConfig): Promise<MonitorConfig> {
    this.monitors.set(config.id, config);
    if (config.isActive) {
      this.startMonitoring(config.id);
    }
    return config;
  }

  async removeMonitor(monitorId: string): Promise<void> {
    this.stopMonitoring(monitorId);
    this.monitors.delete(monitorId);
  }

  async toggleMonitor(monitorId: string): Promise<MonitorConfig> {
    const monitor = this.monitors.get(monitorId);
    if (!monitor) throw new Error(`Monitor '${monitorId}' not found`);

    monitor.isActive = !monitor.isActive;

    if (monitor.isActive) {
      this.startMonitoring(monitorId);
    } else {
      this.stopMonitoring(monitorId);
    }

    return monitor;
  }

  async getMonitorEvents(monitorId: string): Promise<MonitorEvent[]> {
    return this.events.filter((e) => e.monitorId === monitorId);
  }

  async getAlerts(userId: string): Promise<Alert[]> {
    return this.alerts.filter((a) => a.userId === userId);
  }

  async acknowledgeAlert(alertId: string): Promise<Alert> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error(`Alert '${alertId}' not found`);

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date().toISOString();
    return alert;
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error(`Alert '${alertId}' not found`);

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date().toISOString();
    return alert;
  }

  async checkContract(monitorId: string): Promise<MonitorEvent[]> {
    const monitor = this.monitors.get(monitorId);
    if (!monitor || !monitor.isActive) return [];

    const newEvents: MonitorEvent[] = [];

    for (const rule of monitor.rules) {
      if (!rule.isEnabled) continue;
      const events = await this.checkRule(monitor, rule);
      newEvents.push(...events);
    }

    this.events.push(...newEvents);
    monitor.lastCheckedAt = new Date().toISOString();

    for (const event of newEvents) {
      this.createAlert(monitor, event);
    }

    return newEvents;
  }

  async checkAllMonitors(): Promise<Map<string, MonitorEvent[]>> {
    const results = new Map<string, MonitorEvent[]>();

    for (const [id] of this.monitors) {
      const events = await this.checkContract(id);
      if (events.length > 0) {
        results.set(id, events);
      }
    }

    return results;
  }

  /* Private helpers */

  private startMonitoring(monitorId: string): void {
    const monitor = this.monitors.get(monitorId);
    if (!monitor) return;

    const intervalId = setInterval(
      () => this.checkContract(monitorId),
      monitor.checkInterval * 1000,
    );
    this.intervals.set(monitorId, intervalId);
  }

  private stopMonitoring(monitorId: string): void {
    const intervalId = this.intervals.get(monitorId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(monitorId);
    }
  }

  private async checkRule(monitor: MonitorConfig, rule: MonitorRule): Promise<MonitorEvent[]> {
    const sinceIso = monitor.lastCheckedAt ?? new Date(Date.now() - 3600_000).toISOString();

    try {
      const triggered = await this.evaluateRule(monitor, rule, sinceIso);
      return triggered;
    } catch (error) {
      console.warn(`Error checking rule '${rule.name}':`, error);
      return [];
    }
  }

  private async evaluateRule(
    monitor: MonitorConfig,
    rule: MonitorRule,
    sinceIso: string,
  ): Promise<MonitorEvent[]> {
    switch (rule.type) {
      case "ownership_transfer":
        return evaluateOwnershipTransfer(this.horizonClient, monitor, rule, sinceIso);
      case "large_withdrawal":
        return evaluateLargeWithdrawal(this.horizonClient, monitor, rule, sinceIso);
      case "suspicious_tx_spike":
        return evaluateSuspiciousTxSpike(this.horizonClient, monitor, rule, sinceIso);
      case "function_call":
        return evaluateFunctionCall(this.horizonClient, monitor, rule, sinceIso);
      case "balance_change":
        return evaluateBalanceChange(this.horizonClient, monitor, rule);
      case "event_emission":
        return evaluateEventEmission(this.horizonClient, monitor, rule, sinceIso);
      case "custom":
        return evaluateCustomRule(this.horizonClient, monitor, rule);
      default:
        return [];
    }
  }

  private createAlert(monitor: MonitorConfig, event: MonitorEvent): Alert {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      monitorId: monitor.id,
      userId: monitor.userId,
      contractId: monitor.contractId,
      title: event.description,
      description: `${event.ruleType}: ${event.description}`,
      severity: AlertSeverity.MEDIUM,
      status: AlertStatus.ACTIVE,
      category: event.ruleType,
      txHash: event.txHash,
      blockNumber: event.blockNumber,
      data: event.data,
      acknowledgedAt: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.alerts.push(alert);
    return alert;
  }
}

export type {
  Monitor as MonitorConfig,
  MonitorRule,
  MonitorRuleType,
  MonitorEvent,
  Alert,
} from "@sentinelai/shared";
export { AlertSeverity, AlertStatus } from "@sentinelai/shared";
