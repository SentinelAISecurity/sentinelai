import { Terminal, ArrowRight, Code2, Upload, Github, Search, Link2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@sentinelai/ui";

const auditModes = [
  {
    icon: Upload,
    title: "Upload Solidity File",
    description: "Upload a .sol file for comprehensive static analysis and AI-powered vulnerability detection.",
    action: "Upload File",
    href: "/audits/new?mode=upload",
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-600/10",
  },
  {
    icon: Terminal,
    title: "Paste Source Code",
    description: "Paste Solidity code directly into the editor for instant analysis and fix suggestions.",
    action: "Paste Code",
    href: "/audits/new?mode=paste",
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-600/10",
  },
  {
    icon: Github,
    title: "GitHub Repository",
    description: "Analyze a complete GitHub repository for vulnerabilities across multiple contracts.",
    action: "Analyze Repo",
    href: "/audits/new?mode=github",
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-600/10",
  },
  {
    icon: Search,
    title: "Deployed Contract",
    description: "Analyze a deployed contract by address. Verify source code and detect runtime vulnerabilities.",
    action: "Analyze Address",
    href: "/audits/new?mode=address",
    color: "text-yellow-400",
    gradient: "from-yellow-500/10 to-yellow-600/10",
  },
];

export default function AuditsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Security Audits</h1>
        <p className="text-sm text-gray-400 mt-1">
          Analyze smart contracts with AI-powered vulnerability detection
        </p>
      </div>

      {/* Audit Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {auditModes.map((mode) => (
          <Link key={mode.title} href={mode.href}>
            <Card className={`h-full bg-gradient-to-br ${mode.gradient} border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 group cursor-pointer`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center mb-4 ${mode.color}`}>
                    <mode.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{mode.title}</h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{mode.description}</p>
                <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                  {mode.action} →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Audits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Past Audits</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium text-gray-400 mb-2">No audits yet</p>
            <p className="text-sm mb-4">Start your first security audit to analyze a smart contract.</p>
            <Link href="/audits/new">
              <Button size="sm">Start New Audit</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
