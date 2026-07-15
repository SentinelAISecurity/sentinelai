export interface ChainInfo {
  id: string;
  name: string;
  horizonUrl: string;
  explorerUrl: string;
  network: string;
  passphrase: string;
  testnet: boolean;
  nativeAsset: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface Transaction {
  hash: string;
  source: string;
  fee: string;
  operationCount: number;
  memo: string;
  createdAt: string;
  successful: boolean;
  /** @deprecated Use source instead */
  from?: string;
  /** @deprecated Unused on Stellar */
  to?: string;
  /** @deprecated Unused on Stellar */
  value?: string;
  /** @deprecated Unused on Stellar */
  gas?: string;
  /** @deprecated Unused on Stellar */
  gasPrice?: string;
  /** @deprecated Unused on Stellar */
  input?: string;
  /** @deprecated Use ledger instead */
  blockNumber?: number;
  /** @deprecated Use successful instead */
  status?: boolean;
}

export interface EventLog {
  contractId: string;
  topics: string[];
  data: string;
  ledger: number;
  transactionHash: string;
}

export interface AuditRegistryEntry {
  contractAddress: string;
  reportHash: string;
  timestamp: string;
  auditor: string;
  securityScore: number;
}

export const STELLAR_NETWORKS: ChainInfo[] = [
  {
    id: "stellar-public",
    name: "Stellar Mainnet",
    horizonUrl: "https://horizon.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/public",
    network: "public",
    passphrase: "Public Global Stellar Network ; September 2015",
    testnet: false,
    nativeAsset: { name: "Lumen", symbol: "XLM", decimals: 7 },
  },
  {
    id: "stellar-testnet",
    name: "Stellar Testnet",
    horizonUrl: "https://horizon-testnet.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/testnet",
    network: "testnet",
    passphrase: "Test SDF Network ; September 2015",
    testnet: true,
    nativeAsset: { name: "Lumen", symbol: "XLM", decimals: 7 },
  },
  {
    id: "stellar-futurenet",
    name: "Stellar Futurenet",
    horizonUrl: "https://horizon-futurenet.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/futurenet",
    network: "futurenet",
    passphrase: "Test SDF Future Network ; October 2022",
    testnet: true,
    nativeAsset: { name: "Lumen", symbol: "XLM", decimals: 7 },
  },
];

/** @deprecated Use STELLAR_NETWORKS instead */
export const SUPPORTED_CHAINS: ChainInfo[] = STELLAR_NETWORKS;
