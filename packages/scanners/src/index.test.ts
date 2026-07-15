import { describe, it, expect, beforeEach } from "vitest";
import { SecurityPlugin, PluginManager } from "./index";
import { PluginType } from "@sentinelai/shared";
import type { PluginManifest, VulnerabilityCreateInput } from "@sentinelai/shared";

function createManifest(overrides: Partial<PluginManifest> = {}): PluginManifest {
  return {
    name: "test-scanner",
    version: "1.0.0",
    type: PluginType.SCANNER,
    description: "A test scanner plugin for unit tests",
    author: "Test Author",
    license: "Apache-2.0",
    severity: "HIGH",
    entryPoint: "scanner.py",
    dependencies: [],
    targets: ["solidity"],
    config: {
      enabled: true,
      timeout: 30000,
      maxMemory: 256,
      customSettings: {},
    },
    ...overrides,
  };
}

describe("SecurityPlugin", () => {
  let manifest: PluginManifest;

  beforeEach(() => {
    manifest = createManifest();
  });

  describe("constructor", () => {
    it("should create a plugin with correct id", () => {
      const plugin = new SecurityPlugin(manifest);
      expect(plugin.id).toBe("plugin_test-scanner_1.0.0");
    });

    it("should set all manifest properties", () => {
      const plugin = new SecurityPlugin(manifest);
      expect(plugin.name).toBe("test-scanner");
      expect(plugin.version).toBe("1.0.0");
      expect(plugin.type).toBe(PluginType.SCANNER);
      expect(plugin.description).toBe("A test scanner plugin for unit tests");
      expect(plugin.author).toBe("Test Author");
      expect(plugin.license).toBe("Apache-2.0");
      expect(plugin.severity).toBe("HIGH");
      expect(plugin.entryPoint).toBe("scanner.py");
      expect(plugin.dependencies).toEqual([]);
      expect(plugin.targets).toEqual(["solidity"]);
    });

    it("should set isBuiltIn flag", () => {
      const builtIn = new SecurityPlugin(manifest, true);
      expect(builtIn.isBuiltIn).toBe(true);

      const external = new SecurityPlugin(manifest, false);
      expect(external.isBuiltIn).toBe(false);

      const defaultPlugin = new SecurityPlugin(manifest);
      expect(defaultPlugin.isBuiltIn).toBe(false);
    });

    it("should set isEnabled from manifest config", () => {
      const enabled = new SecurityPlugin(createManifest({ config: { enabled: true, timeout: 30000, maxMemory: 256, customSettings: {} } }));
      expect(enabled.isEnabled).toBe(true);

      const disabled = new SecurityPlugin(createManifest({ config: { enabled: false, timeout: 30000, maxMemory: 256, customSettings: {} } }));
      expect(disabled.isEnabled).toBe(false);
    });

    it("should initialize performance metrics to defaults", () => {
      const plugin = new SecurityPlugin(manifest);
      expect(plugin.performance.averageTime).toBe(0);
      expect(plugin.performance.totalScans).toBe(0);
      expect(plugin.performance.vulnerabilitiesFound).toBe(0);
      expect(plugin.performance.falsePositives).toBe(0);
      expect(plugin.performance.accuracy).toBe(1.0);
    });

    it("should store custom config settings", () => {
      const manifestWithSettings = createManifest({
        config: {
          enabled: true,
          timeout: 60000,
          maxMemory: 512,
          customSettings: { depth: 5, patterns: ["reentrancy", "overflow"] },
        },
      });
      const plugin = new SecurityPlugin(manifestWithSettings);
      expect(plugin.config.timeout).toBe(60000);
      expect(plugin.config.maxMemory).toBe(512);
      expect(plugin.config.customSettings).toEqual({ depth: 5, patterns: ["reentrancy", "overflow"] });
    });
  });

  describe("analyze", () => {
    it("should return a successful PluginResult by default", async () => {
      const plugin = new SecurityPlugin(manifest);
      const result = await plugin.analyze("pragma solidity ^0.8.0; contract Test {}");

      expect(result.success).toBe(true);
      expect(result.pluginId).toBe("plugin_test-scanner_1.0.0");
      expect(result.pluginName).toBe("test-scanner");
      expect(result.vulnerabilities).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.analysisVersion).toBe("1.0.0");
      expect(result.metadata.targetCount).toBe(1);
    });

    it("should update performance after analysis", async () => {
      const plugin = new SecurityPlugin(manifest);
      await plugin.analyze("contract Test {}");

      expect(plugin.performance.totalScans).toBe(1);
      expect(plugin.performance.averageTime).toBeGreaterThanOrEqual(0);
    });

    it("should track accumulated performance across multiple analyses", async () => {
      const plugin = new SecurityPlugin(manifest);
      await plugin.analyze("contract Test1 {}");
      await plugin.analyze("contract Test2 {}");
      await plugin.analyze("contract Test3 {}");

      expect(plugin.performance.totalScans).toBe(3);
    });

    it("should handle runAnalysis throwing an error gracefully", async () => {
      // Create a subclass that overrides runAnalysis to always throw
      class FailingPlugin extends SecurityPlugin {
        private async runAnalysis(
          _sourceCode: string,
        ): Promise<{ vulnerabilities: VulnerabilityCreateInput[]; warnings: string[] }> {
          throw new Error("Simulated analysis failure");
        }
      }

      const failingPlugin = new FailingPlugin(manifest);
      const result = await failingPlugin.analyze("contract Test {}");

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Plugin 'test-scanner' failed");
      expect(result.errors[0]).toContain("Simulated analysis failure");
      expect(result.vulnerabilities).toEqual([]);
    });
  });

  describe("plugin id uniqueness", () => {
    it("should create unique ids for different versions", () => {
      const v1 = new SecurityPlugin(createManifest({ name: "test", version: "1.0.0" }));
      const v2 = new SecurityPlugin(createManifest({ name: "test", version: "2.0.0" }));
      expect(v1.id).not.toBe(v2.id);
    });

    it("should create unique ids for different names", () => {
      const a = new SecurityPlugin(createManifest({ name: "scanner-a" }));
      const b = new SecurityPlugin(createManifest({ name: "scanner-b" }));
      expect(a.id).not.toBe(b.id);
    });
  });
});

describe("PluginManager", () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe("loadPlugin", () => {
    it("should load a new plugin", async () => {
      const plugin = await manager.loadPlugin(createManifest());
      expect(plugin.name).toBe("test-scanner");
      expect(manager.plugins).toHaveLength(1);
    });

    it("should not duplicate plugins with same name+version", async () => {
      const manifest = createManifest();
      const p1 = await manager.loadPlugin(manifest);
      const p2 = await manager.loadPlugin(manifest);

      expect(manager.plugins).toHaveLength(1);
      expect(p1).toBe(p2);
    });

    it("should increment plugin count for different plugins", async () => {
      await manager.loadPlugin(createManifest({ name: "plugin-a" }));
      await manager.loadPlugin(createManifest({ name: "plugin-b" }));
      await manager.loadPlugin(createManifest({ name: "plugin-c" }));

      expect(manager.plugins).toHaveLength(3);
    });
  });

  describe("unloadPlugin", () => {
    it("should remove a plugin by id", async () => {
      const plugin = await manager.loadPlugin(createManifest({ name: "temp" }));
      expect(manager.plugins).toHaveLength(1);

      await manager.unloadPlugin(plugin.id);
      expect(manager.plugins).toHaveLength(0);
    });

    it("should not throw when unloading non-existent plugin", async () => {
      await expect(manager.unloadPlugin("non-existent")).resolves.toBeUndefined();
      expect(manager.plugins).toHaveLength(0);
    });
  });

  describe("getPlugin", () => {
    it("should retrieve a plugin by id", async () => {
      const plugin = await manager.loadPlugin(createManifest());
      const found = manager.getPlugin(plugin.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("test-scanner");
    });

    it("should return undefined for unknown plugin", () => {
      expect(manager.getPlugin("unknown")).toBeUndefined();
    });
  });

  describe("getPluginsByType", () => {
    it("should filter plugins by type", async () => {
      await manager.loadPlugin(createManifest({ name: "scanner-a", type: PluginType.SCANNER }));
      await manager.loadPlugin(createManifest({ name: "analyzer-a", type: PluginType.ANALYZER }));
      await manager.loadPlugin(createManifest({ name: "scanner-b", type: PluginType.SCANNER }));

      const scanners = manager.getPluginsByType(PluginType.SCANNER);
      expect(scanners).toHaveLength(2);
      expect(scanners.every((p) => p.type === PluginType.SCANNER)).toBe(true);

      const analyzers = manager.getPluginsByType(PluginType.ANALYZER);
      expect(analyzers).toHaveLength(1);
    });

    it("should return empty array when no plugins match type", () => {
      expect(manager.getPluginsByType(PluginType.MONITOR)).toHaveLength(0);
    });
  });

  describe("getEnabledPlugins", () => {
    it("should return only enabled plugins", async () => {
      const enabledManifest = createManifest({ name: "enabled", config: { enabled: true, timeout: 30000, maxMemory: 256, customSettings: {} } });
      const disabledManifest = createManifest({ name: "disabled", config: { enabled: false, timeout: 30000, maxMemory: 256, customSettings: {} } });

      await manager.loadPlugin(enabledManifest);
      await manager.loadPlugin(disabledManifest);

      const enabled = manager.getEnabledPlugins();
      expect(enabled).toHaveLength(1);
      expect(enabled[0]?.name).toBe("enabled");
    });
  });

  describe("discoverPlugins", () => {
    it("should return all loaded plugins", async () => {
      await manager.loadPlugin(createManifest({ name: "a" }));
      await manager.loadPlugin(createManifest({ name: "b" }));

      const discovered = await manager.discoverPlugins();
      expect(discovered).toHaveLength(2);
    });
  });

  describe("analyzeWithPlugins", () => {
    it("should run analysis on all enabled plugins", async () => {
      const manifest = createManifest({ name: "active-scanner", config: { enabled: true, timeout: 30000, maxMemory: 256, customSettings: {} } });
      await manager.loadPlugin(manifest);

      const results = await manager.analyzeWithPlugins("contract Test {}");
      expect(results).toHaveLength(1);
      expect(results[0]?.success).toBe(true);
      expect(results[0]?.pluginName).toBe("active-scanner");
    });

    it("should skip disabled plugins", async () => {
      const disabledManifest = createManifest({ name: "inactive", config: { enabled: false, timeout: 30000, maxMemory: 256, customSettings: {} } });
      await manager.loadPlugin(disabledManifest);

      const results = await manager.analyzeWithPlugins("contract Test {}");
      expect(results).toHaveLength(0);
    });

    it("should handle empty plugin list gracefully", async () => {
      const results = await manager.analyzeWithPlugins("contract Test {}");
      expect(results).toEqual([]);
    });

    it("should run multiple plugins and aggregate results", async () => {
      await manager.loadPlugin(createManifest({
        name: "scanner-1",
        config: { enabled: true, timeout: 30000, maxMemory: 256, customSettings: {} },
      }));
      await manager.loadPlugin(createManifest({
        name: "scanner-2",
        config: { enabled: true, timeout: 30000, maxMemory: 256, customSettings: {} },
      }));
      await manager.loadPlugin(createManifest({
        name: "scanner-3",
        config: { enabled: true, timeout: 30000, maxMemory: 256, customSettings: {} },
      }));

      const results = await manager.analyzeWithPlugins("contract Test {}");
      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });
});
