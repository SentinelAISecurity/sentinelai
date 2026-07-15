export enum ContractStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DEPRECATED = "deprecated",
  PAUSED = "paused",
  DESTROYED = "destroyed",
}

export interface Contract {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  address: string | null;
  chainId: string | null;
  sourceCode: string | null;
  sourceHash: string | null;
  compiler: string | null;
  compilerVersion: string | null;
  optimization: boolean;
  optimizationRuns: number;
  license: string | null;
  status: ContractStatus;
  abi: unknown;
  bytecode: string | null;
  deployedBytecode: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastAuditedAt: string | null;
  lastMonitoredAt: string | null;
}

export interface ContractCreateRequest {
  name: string;
  description?: string;
  sourceCode?: string;
  address?: string;
  chainId?: string;
  compiler?: string;
  compilerVersion?: string;
}

export interface ContractAnalysis {
  contractId: string;
  sloc: number;
  totalFunctions: number;
  externalFunctions: number;
  publicFunctions: number;
  internalFunctions: number;
  privateFunctions: number;
  modifiers: number;
  events: number;
  structs: number;
  enums: number;
  mappings: number;
  arrays: number;
  inheritanceTree: string[];
  dependencies: string[];
  libraries: string[];
  interfaces: string[];
}
