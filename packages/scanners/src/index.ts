import type {
  Plugin,
  PluginType,
  PluginManifest,
  PluginResult,
  PluginRegistry,
  VulnerabilityCreateInput,
} from "@sentinelai/shared";

export class SecurityPlugin implements Plugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description: string;
  author: string;
  license: string;
  severity: string;
  isBuiltIn: boolean;
  isEnabled: boolean;
  entryPoint: string;
  dependencies: string[];
  config: Plugin["config"];
  targets: string[];
  performance: Plugin["performance"];

  constructor(manifest: PluginManifest, isBuiltIn = false) {
    this.id = `plugin_${manifest.name}_${manifest.version}`;
    this.name = manifest.name;
    this.version = manifest.version;
    this.type = manifest.type;
    this.description = manifest.description;
    this.author = manifest.author;
    this.license = manifest.license;
    this.severity = manifest.severity;
    this.isBuiltIn = isBuiltIn;
    this.isEnabled = manifest.config.enabled;
    this.entryPoint = manifest.entryPoint;
    this.dependencies = manifest.dependencies;
    this.config = {
      enabled: manifest.config.enabled,
      timeout: manifest.config.timeout,
      maxMemory: manifest.config.maxMemory,
      customSettings: manifest.config.customSettings,
    };
    this.targets = manifest.targets;
    this.performance = {
      averageTime: 0,
      totalScans: 0,
      vulnerabilitiesFound: 0,
      falsePositives: 0,
      accuracy: 1.0,
    };
  }

  async analyze(sourceCode: string): Promise<PluginResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const vulnerabilities: VulnerabilityCreateInput[] = [];

    try {
      const analysisResult = await this.runAnalysis(sourceCode);
      vulnerabilities.push(...analysisResult.vulnerabilities);
      warnings.push(...analysisResult.warnings);
    } catch (error) {
      errors.push(
        `Plugin '${this.name}' failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const executionTime = Date.now() - startTime;
    this.updatePerformance(executionTime, vulnerabilities.length);

    return {
      pluginId: this.id,
      pluginName: this.name,
      success: errors.length === 0,
      executionTime,
      vulnerabilities,
      errors,
      warnings,
      metadata: {
        analysisVersion: this.version,
        targetCount: this.targets.length,
      },
    };
  }

  private async runAnalysis(
    _sourceCode: string,
  ): Promise<{ vulnerabilities: VulnerabilityCreateInput[]; warnings: string[] }> {
    // Override in subclasses to implement specific analysis logic
    const vulnerabilities: VulnerabilityCreateInput[] = [];
    const warnings: string[] = [];

    return { vulnerabilities, warnings };
  }

  private updatePerformance(executionTime: number, vulnCount: number): void {
    const prev = this.performance;
    const newTotalScans = prev.totalScans + 1;
    this.performance = {
      averageTime: (prev.averageTime * prev.totalScans + executionTime) / newTotalScans,
      totalScans: newTotalScans,
      vulnerabilitiesFound: prev.vulnerabilitiesFound + vulnCount,
      falsePositives: prev.falsePositives,
      accuracy: prev.accuracy,
    };
  }
}

export class PluginManager implements PluginRegistry {
  plugins: Plugin[] = [];

  constructor() {}

  async loadPlugin(manifest: PluginManifest): Promise<Plugin> {
    const existing = this.plugins.find((p) => p.id === `plugin_${manifest.name}_${manifest.version}`);
    if (existing) {
      return existing;
    }

    const plugin = new SecurityPlugin(manifest);
    this.plugins.push(plugin);
    return plugin;
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    this.plugins = this.plugins.filter((p) => p.id !== pluginId);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.find((p) => p.id === pluginId);
  }

  getPluginsByType(type: PluginType): Plugin[] {
    return this.plugins.filter((p) => p.type === type);
  }

  getEnabledPlugins(): Plugin[] {
    return this.plugins.filter((p) => p.isEnabled);
  }

  async discoverPlugins(): Promise<Plugin[]> {
    return this.plugins;
  }

  async analyzeWithPlugins(sourceCode: string): Promise<PluginResult[]> {
    const results: PluginResult[] = [];
    const enabledPlugins = this.getEnabledPlugins();

    for (const plugin of enabledPlugins) {
      const pluginInstance = plugin as SecurityPlugin;
      const result = await pluginInstance.analyze(sourceCode);
      results.push(result);
    }

    return results;
  }
}

export type { PluginManifest, PluginResult, PluginRegistry } from "@sentinelai/shared";
