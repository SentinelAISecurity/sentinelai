import type {
  Monitor as MonitorConfig,
  MonitorRule,
  MonitorRuleType,
  MonitorEvent,
  Alert,
  AlertSeverity,
  AlertStatus,
} from "@sentinelai/shared";

export class ContractMonitor {
  private monitors: Map<string, MonitorConfig> = new Map();
  private events: MonitorEvent[] = [];
  private alerts: Alert[] = [];
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();

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
    const events: MonitorEvent[] = [];

    try {
      const triggered = await this.evaluateRule(monitor, rule);
      if (triggered) {
        events.push({
          id: `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          monitorId: monitor.id,
          txHash: "",
          blockNumber: 0,
          timestamp: new Date().toISOString(),
          ruleType: rule.type,
          description: `Rule '${rule.name}' triggered for ${monitor.contractAddress}`,
          data: {
            monitorName: monitor.name,
            ruleName: rule.name,
            contractAddress: monitor.contractAddress,
          },
        });
      }
    } catch (error) {
      console.warn(`Error checking rule '${rule.name}':`, error);
    }

    return events;
  }

  private async evaluateRule(monitor: MonitorConfig, rule: MonitorRule): Promise<boolean> {
    // In production, this would query the blockchain via RPC
    // and evaluate the specific rule conditions
    return false;
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
  MonitorConfig,
  MonitorRule,
  MonitorRuleType,
  MonitorEvent,
  Alert,
  AlertSeverity,
  AlertStatus,
} from "@sentinelai/shared";
