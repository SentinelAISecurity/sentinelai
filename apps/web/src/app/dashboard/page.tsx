"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  FileSearch,
  Radio,
  Bot,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@sentinelai/ui";
import { cn } from "@sentinelai/ui";

const stats = [
  {
    label: "Total Audits",
    value: "12",
    change: "+3 this week",
    icon: Shield,
    gradient: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
  },
  {
    label: "Active Monitors",
    value: "3",
    change: "All operational",
    icon: Radio,
    gradient: "from-green-500/20 to-green-600/20",
    iconColor: "text-green-400",
  },
  {
    label: "Vulnerabilities Found",
    value: "24",
    change: "3 critical",
    icon: AlertTriangle,
    gradient: "from-red-500/20 to-red-600/20",
    iconColor: "text-red-400",
  },
  {
    label: "Security Score",
    value: "72",
    change: "+5 from last week",
    icon: BarChart3,
    gradient: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-400",
  },
];

const recentAudits = [
  {
    id: "audit_001",
    name: "token_vault.rs",
    type: "DeFi",
    status: "completed",
    score: 65,
    vulnerabilities: 4,
    date: "2024-01-15T10:30:00Z",
  },
  {
    id: "audit_002",
    name: "staking_pool.rs",
    type: "Staking",
    status: "completed",
    score: 88,
    vulnerabilities: 1,
    date: "2024-01-14T15:00:00Z",
  },
  {
    id: "audit_003",
    name: "nft_marketplace.rs",
    type: "NFT",
    status: "completed",
    score: 75,
    vulnerabilities: 3,
    date: "2024-01-13T09:15:00Z",
  },
];

const severityData = [
  { label: "Critical", value: 3, color: "bg-red-500", percent: "13%" },
  { label: "High", value: 7, color: "bg-orange-500", percent: "29%" },
  { label: "Medium", value: 8, color: "bg-yellow-500", percent: "33%" },
  { label: "Low", value: 4, color: "bg-blue-500", percent: "17%" },
  { label: "Info", value: 2, color: "bg-gray-500", percent: "8%" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview of your security posture and recent activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            All Systems Operational
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br", stat.gradient)}>
                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.change}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Recent Audits</h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View All
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-700/30">
                {recentAudits.map((audit) => (
                  <div key={audit.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <FileSearch className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">{audit.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                          {audit.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(audit.date).toLocaleDateString()} · {audit.vulnerabilities} findings
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-2 py-1 rounded-lg text-xs font-medium",
                        audit.score >= 80
                          ? "bg-green-500/10 text-green-400"
                          : audit.score >= 60
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      )}>
                        Score: {audit.score}
                      </div>
                      <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs capitalize">
                        {audit.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">Severity Distribution</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {severityData.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className="text-sm text-gray-500">{item.percent}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", item.color)}
                        style={{ width: item.percent }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">AI Assistant</div>
                    <div className="text-xs text-gray-400">
                      Ready to help analyze your contracts
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
