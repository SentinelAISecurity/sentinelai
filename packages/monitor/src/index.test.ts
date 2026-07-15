import { describe, it, expect, beforeEach, vi } from "vitest";
import { ContractMonitor } from "./index";
import type { Monitor, MonitorRule, MonitorRuleType } from "@sentinelai/shared";

function createMonitor(overrides: Partial<Monitor> = {}): Monitor {
  return {
    id: "mon-001",
    userId: "user-001",
    contractId: "contract-001",
    name: "Test Monitor",
    description: "A test monitor",
    chainId: "stellar-testnet",
    contractAddress: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
    isActive: true,
    checkInterval: 300,
    rules: [],
    lastCheckedAt: null,
    totalAlerts: 0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function createRule(overrides: Partial<MonitorRule> = {}): MonitorRule {
  return {
    id: "rule-001",
    type: "ownership_transfer" as MonitorRuleType,
    name: "Test Rule",
    description: "A test rule",
    isEnabled: true,
    threshold: {
      minAmount: null,
      maxAmount: null,
      minFrequency: null,
      timeWindow: 300,
      alertCooldown: 60,
    },
    targetAddresses: [],
    targetFunctions: [],
    targetEvents: [],
    notificationChannels: ["in_app"],
    metadata: {},
    ...overrides,
  };
}

describe("ContractMonitor", () => {
  let monitor: ContractMonitor;

  beforeEach(() => {
    vi.restoreAllMocks();
    monitor = new ContractMonitor("https://horizon-testnet.stellar.org");
  });

  describe("addMonitor", () => {
    it("should add a monitor and start monitoring if active", async () => {
      const config = createMonitor();
      const result = await monitor.addMonitor(config);
      expect(result.id).toBe("mon-001");
      expect(result.name).toBe("Test Monitor");
    });

    it("should not start monitoring for inactive monitors", async () => {
      const config = createMonitor({ isActive: false });
      await monitor.addMonitor(config);

      const events = await monitor.checkContract("mon-001");
      expect(events).toEqual([]);
    });
  });

  describe("removeMonitor", () => {
    it("should remove a monitor", async () => {
      await monitor.addMonitor(createMonitor());
      await monitor.removeMonitor("mon-001");

      const events = await monitor.checkContract("mon-001");
      expect(events).toEqual([]);
    });
  });

  describe("toggleMonitor", () => {
    it("should toggle isActive flag", async () => {
      await monitor.addMonitor(createMonitor({ isActive: true }));
      const toggled = await monitor.toggleMonitor("mon-001");
      expect(toggled.isActive).toBe(false);
    });

    it("should throw for unknown monitor", async () => {
      await expect(monitor.toggleMonitor("nonexistent")).rejects.toThrow(
        "Monitor 'nonexistent' not found",
      );
    });
  });

  describe("getMonitorEvents", () => {
    it("should return empty when no events recorded", async () => {
      const events = await monitor.getMonitorEvents("mon-001");
      expect(events).toEqual([]);
    });
  });

  describe("getAlerts", () => {
    it("should filter alerts by userId", async () => {
      const alerts = await monitor.getAlerts("user-001");
      expect(alerts).toEqual([]);
    });
  });

  describe("acknowledgeAlert", () => {
    it("should throw for unknown alert", async () => {
      await expect(monitor.acknowledgeAlert("unknown")).rejects.toThrow(
        "Alert 'unknown' not found",
      );
    });
  });

  describe("resolveAlert", () => {
    it("should throw for unknown alert", async () => {
      await expect(monitor.resolveAlert("unknown")).rejects.toThrow(
        "Alert 'unknown' not found",
      );
    });
  });

  describe("checkContract", () => {
    it("should handle inactive monitors silently", async () => {
      await monitor.addMonitor(createMonitor({ isActive: false }));
      const events = await monitor.checkContract("mon-001");
      expect(events).toEqual([]);
    });

    it("should check active monitors and return empty when no rules triggered", async () => {
      await monitor.addMonitor(
        createMonitor({
          rules: [createRule({ type: "large_withdrawal", threshold: { minAmount: "999999999", maxAmount: null, minFrequency: null, timeWindow: 300, alertCooldown: 60 } })],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      // No real Horizon data, so expect empty results (no errors)
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe("checkAllMonitors", () => {
    it("should check all monitors and return empty map when none trigger", async () => {
      await monitor.addMonitor(createMonitor({ id: "mon-a" }));
      await monitor.addMonitor(createMonitor({ id: "mon-b" }));

      const results = await monitor.checkAllMonitors();
      expect(results).toBeInstanceOf(Map);
    });
  });

  describe("checkContract with mock Horizon data", () => {
    it("should detect ownership transfers from set_options ops", async () => {
      const mockOps = [
        {
          id: "op-001",
          type: "set_options",
          type_i: 5,
          transaction_hash: "abc123",
          created_at: new Date().toISOString(),
          signer_key: "GABC",
          signer_weight: 1,
        },
        {
          id: "op-002",
          type: "create_account",
          type_i: 0,
          transaction_hash: "def456",
          created_at: new Date().toISOString(),
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ _embedded: { records: mockOps }, _links: { self: { href: "" } } }),
      });

      await monitor.addMonitor(
        createMonitor({
          rules: [createRule({ type: "ownership_transfer" })],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0]?.ruleType).toBe("ownership_transfer");
      expect(events[0]?.description).toContain("GABC");
    });

    it("should detect large withdrawals from payment ops", async () => {
      const mockOps = [
        {
          id: "op-001",
          type: "payment",
          type_i: 1,
          transaction_hash: "abc123",
          created_at: new Date().toISOString(),
          from: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
          to: "GDEST",
          amount: "1000.0000000",
          asset_type: "native",
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ _embedded: { records: mockOps }, _links: { self: { href: "" } } }),
      });

      await monitor.addMonitor(
        createMonitor({
          rules: [createRule({ type: "large_withdrawal", threshold: { minAmount: "100", maxAmount: null, minFrequency: null, timeWindow: 300, alertCooldown: 60 } })],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0]?.ruleType).toBe("large_withdrawal");
      expect(events[0]?.description).toContain("1000");
      expect(events[0]?.description).toContain("GDEST");
    });

    it("should detect suspicious transaction spikes", async () => {
      const recentOps = Array.from({ length: 15 }, (_, i) => ({
        id: `op-${i}`,
        type: "payment",
        type_i: 1,
        transaction_hash: `tx-${i}`,
        created_at: new Date().toISOString(),
        from: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
        to: `GDEST${i}`,
        amount: "1.0000000",
      }));

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ _embedded: { records: recentOps }, _links: { self: { href: "" } } }),
      });

      await monitor.addMonitor(
        createMonitor({
          rules: [createRule({ type: "suspicious_tx_spike", threshold: { minAmount: null, maxAmount: null, minFrequency: 10, timeWindow: 600, alertCooldown: 60 } })],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0]?.ruleType).toBe("suspicious_tx_spike");
      expect(events[0]?.description).toContain("spike");
    });

    it("should detect function calls on Soroban contracts", async () => {
      const mockOps = [
        {
          id: "op-001",
          type: "invoke_host_function",
          type_i: 21,
          transaction_hash: "abc123",
          created_at: new Date().toISOString(),
          function: "mint",
          parameters: [{ type: "address", value: "GABC" }],
        },
        {
          id: "op-002",
          type: "invoke_host_function",
          type_i: 21,
          transaction_hash: "def456",
          created_at: new Date().toISOString(),
          function: "transfer",
          parameters: [],
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ _embedded: { records: mockOps }, _links: { self: { href: "" } } }),
      });

      await monitor.addMonitor(
        createMonitor({
          rules: [
            createRule({
              type: "function_call",
              targetFunctions: ["mint"],
            }),
          ],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0]?.ruleType).toBe("function_call");
      expect(events[0]?.description).toContain("mint");
    });

    it("should detect event emissions from Soroban contracts", async () => {
      const mockOps = [
        {
          id: "op-001",
          type: "invoke_host_function",
          type_i: 21,
          transaction_hash: "abc123",
          created_at: new Date().toISOString(),
          function: "register_audit",
          parameters: [],
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ _embedded: { records: mockOps }, _links: { self: { href: "" } } }),
      });

      await monitor.addMonitor(
        createMonitor({
          rules: [
            createRule({
              type: "event_emission",
              targetEvents: ["register_audit"],
            }),
          ],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0]?.ruleType).toBe("event_emission");
      expect(events[0]?.description).toContain("register_audit");
    });

    it("should respect disabled rules", async () => {
      globalThis.fetch = vi.fn();

      await monitor.addMonitor(
        createMonitor({
          rules: [createRule({ isEnabled: false, type: "function_call" })],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      expect(events).toEqual([]);
      // fetch should not be called for disabled rules
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("should handle Horizon API errors gracefully", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await monitor.addMonitor(
        createMonitor({
          rules: [createRule({ type: "ownership_transfer" })],
        }),
      );

      // Should not throw — errors are caught and logged
      const events = await monitor.checkContract("mon-001");
      expect(events).toEqual([]);
    });

    it("should handle non-OK Horizon responses gracefully", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => "Not Found",
      });

      await monitor.addMonitor(
        createMonitor({
          rules: [createRule({ type: "ownership_transfer" })],
        }),
      );

      const events = await monitor.checkContract("mon-001");
      expect(events).toEqual([]);
    });
  });
});
