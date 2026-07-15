import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Terminal,
  Zap,
  BarChart3,
  Globe,
  Code2,
  ArrowRight,
  Sparkles,
  Users,
  Lock,
  Activity,
  FileSearch,
  Bot,
  Github,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Vulnerability Detection",
    description:
      "Automatically detect reentrancy, access control flaws, flash loan risks, oracle manipulation, and 15+ other vulnerability types.",
    gradient: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Bot,
    title: "AI-Powered Analysis",
    description:
      "Leverage AI to explain vulnerabilities in plain English, suggest secure fixes, and generate professional audit reports.",
    gradient: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Activity,
    title: "Continuous Monitoring",
    description:
      "Monitor deployed contracts for suspicious activity, ownership transfers, upgrades, and large transactions in real-time.",
    gradient: "from-green-500/20 to-green-600/20",
    iconColor: "text-green-400",
  },
  {
    icon: FileSearch,
    title: "Professional Reports",
    description:
      "Generate detailed audit reports in Markdown, JSON, and PDF formats. Store audit proofs on-chain for verifiability.",
    gradient: "from-yellow-500/20 to-yellow-600/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: Code2,
    title: "Plugin Architecture",
    description:
      "Extend functionality with a pluggable scanner system. Build and share custom security analyzers with the community.",
    gradient: "from-red-500/20 to-red-600/20",
    iconColor: "text-red-400",
  },
  {
    icon: Globe,
    title: "Multi-Chain Support",
    description:
      "Analyze Soroban smart contracts on Stellar — detect vulnerabilities, verify authorization logic, and secure your Rust/Wasm contracts.",
    gradient: "from-cyan-500/20 to-cyan-600/20",
    iconColor: "text-cyan-400",
  },
];

const stats = [
  { label: "Vulnerability Types", value: "15+", icon: Shield },
  { label: "Chain Support", value: "10+", icon: Globe },
  { label: "Community Plugins", value: "5+", icon: Users },
  { label: "Open Source", value: "Apache 2.0", icon: Github },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-8"
            >
              <Sparkles className="h-4 w-4" />
              Open Source AI-Powered Web3 Security Platform
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-white">Secure Your </span>
              <span className="gradient-text">Smart Contracts</span>
              <br />
              <span className="text-white">with </span>
              <span className="text-blue-400">AI-Powered</span>
              <span className="text-white"> Auditing</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Automatically detect vulnerabilities, get AI-powered fix suggestions,
              monitor deployed contracts, and generate professional audit reports —
              all in one open-source platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 py-3 text-base">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg" className="px-8 py-3 text-base">
                  Read the Docs
                </Button>
              </Link>
              <a
                href="https://github.com/sentinelai/sentinelai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="lg" className="px-4 py-3 text-base">
                  <Github className="mr-2 h-5 w-5" />
                  <Star className="mr-1 h-4 w-4 text-yellow-400" />
                  Star us
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-xl p-4 text-center"
              >
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need for{" "}
              <span className="gradient-text">Web3 Security</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive suite of tools for every stage of the smart contract
              lifecycle, from development to post-deployment monitoring.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative group p-6 rounded-2xl border border-gray-700/30 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center mb-4 ${feature.iconColor}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-2xl p-12 border border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Secure Your Contracts?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join the community of developers and researchers building a safer
                Web3 ecosystem with SentinelAI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-3">
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/docs/contribute">
                  <Button variant="outline" size="lg" className="px-8 py-3">
                    Contribute on GitHub
                    <Github className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
