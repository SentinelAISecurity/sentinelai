"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Menu,
  X,
  Search,
  Terminal,
  BookOpen,
  Github,
  Twitter,
  Activity,
  Wallet,
  LogOut,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider";
import { formatAddress } from "@sentinelai/shared";
import { toast } from "sonner";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/audits", label: "Audits", icon: Shield },
  { href: "/contracts", label: "Contracts", icon: Terminal },
  { href: "/monitoring", label: "Monitoring", icon: Search },
  { href: "/docs", label: "Docs", icon: BookOpen },
];

function WalletButton() {
  const { wallet, isAuthenticated, authenticate, logout, userAddress } = useWallet();
  const { state, connect } = wallet;
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (userAddress) {
      await navigator.clipboard.writeText(userAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleAuthenticate = async () => {
    setIsAuthLoading(true);
    try {
      const success = await authenticate();
      if (success) {
        toast.success("Wallet authenticated successfully");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } catch {
      toast.error("Authentication failed");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Wallet disconnected");
  };

  if (state.status === "not_installed") {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Install Freighter
        </Button>
      </a>
    );
  }

  if (state.status === "connected") {
    if (!isAuthenticated) {
      return (
        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={handleAuthenticate}
          isLoading={isAuthLoading}
        >
          <Shield className="h-4 w-4" />
          Sign In with Stellar
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono hover:bg-green-500/20 transition-colors"
          title="Click to copy address"
        >
          <span>{formatAddress(userAddress ?? "", 4)}</span>
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (state.status === "connecting") {
    return (
      <Button variant="primary" size="sm" isLoading className="gap-2">
        <Wallet className="h-4 w-4" />
        Connecting...
      </Button>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">{state.message}</span>
        <Button variant="outline" size="sm" onClick={handleConnect}>
          Retry
        </Button>
      </div>
    );
  }

  // disconnected
  return (
    <Button variant="primary" size="sm" className="gap-2" onClick={handleConnect}>
      <Wallet className="h-4 w-4" />
      Connect Freighter
    </Button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse-slow" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              <span className="text-white">Sentinel</span>
              <span className="text-blue-500">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
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
            <WalletButton />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-700/20"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3">
                <WalletButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
