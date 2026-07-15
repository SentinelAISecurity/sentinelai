export enum PluginType {
  SCANNER = "scanner",
  ANALYZER = "analyzer",
  MONITOR = "monitor",
  REPORTER = "reporter",
  AI = "ai",
  CUSTOM = "custom",
}

export interface Plugin {
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
  config: PluginConfig;
  targets: string[];
  performance: PluginPerformance;
}

export interface PluginConfig {
  enabled: boolean;
  timeout: number;
  maxMemory: number;
  customSettings: Record<string, unknown>;
}

export interface PluginPerformance {
  averageTime: number;
  totalScans: number;
  vulnerabilitiesFound: number;
  falsePositives: number;
  accuracy: number;
}

export interface PluginManifest {
  name: string;
  version: string;
  type: PluginType;
  description: string;
  author: string;
  license: string;
  severity: string;
  entryPoint: string;
  dependencies: string[];
  targets: string[];
  config: {
    enabled: boolean;
    timeout: number;
    maxMemory: number;
    customSettings: Record<string, unknown>;
  };
}

export interface PluginResult {
  pluginId: string;
  pluginName: string;
  success: boolean;
  executionTime: number;
  vulnerabilities: import("./vulnerability").VulnerabilityCreateInput[];
  errors: string[];
  warnings: string[];
  metadata: Record<string, unknown>;
}

export interface PluginRegistry {
  plugins: Plugin[];
  loadPlugin: (manifest: PluginManifest) => Promise<Plugin>;
  unloadPlugin: (pluginId: string) => Promise<void>;
  getPlugin: (pluginId: string) => Plugin | undefined;
  getPluginsByType: (type: PluginType) => Plugin[];
  getEnabledPlugins: () => Plugin[];
  discoverPlugins: () => Promise<Plugin[]>;
}
