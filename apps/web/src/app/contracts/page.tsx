import { Shield, Terminal, Cpu, Box } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@sentinelai/ui";

const contractTypes = [
  { icon: Shield, label: "Token", description: "ERC20, ERC721, ERC1155 contracts" },
  { icon: Terminal, label: "DeFi", description: "DEX, lending, staking protocols" },
  { icon: Cpu, label: "DAO", description: "Governance and voting contracts" },
  { icon: Box, label: "Infrastructure", description: "Bridges, oracles, wallets" },
];

export default function ContractsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Contracts</h1>
        <p className="text-sm text-gray-400 mt-1">Manage and analyze your smart contracts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {contractTypes.map((type) => (
          <Card key={type.label} hover>
            <CardContent className="p-5 text-center">
              <type.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <div className="font-medium text-white">{type.label}</div>
              <div className="text-xs text-gray-400 mt-1">{type.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Your Contracts</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Terminal className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium text-gray-400 mb-2">No contracts yet</p>
            <p className="text-sm">Upload or analyze a contract to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
