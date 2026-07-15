"use client";

import Link from "next/link";
import { Shield, Github, Twitter, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-700/20 bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="font-bold text-lg">
                <span className="text-white">Sentinel</span>
                <span className="text-blue-500">AI</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm">
              Open-source AI-powered Web3 security platform. Build safer smart contracts with automated auditing, monitoring, and AI-driven insights.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/sentinelai/sentinelai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/sentinelai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/audits" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  Security Audits
                </Link>
              </li>
              <li>
                <Link href="/monitoring" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  Monitoring
                </Link>
              </li>
              <li>
                <Link href="/plugins" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  Plugins
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/sentinelai/sentinelai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/api-docs" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SentinelAI. Built with <Heart className="inline h-3 w-3 text-red-500" /> by the community.
          </p>
          <p className="text-sm text-gray-500">
            Licensed under Apache 2.0
          </p>
        </div>
      </div>
    </footer>
  );
}
