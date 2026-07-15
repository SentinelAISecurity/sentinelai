"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { FreighterWallet } from "@/hooks/useFreighterWallet";
import { useFreighterWallet } from "@/hooks/useFreighterWallet";
import { SentinelAIClient } from "@sentinelai/sdk";

interface WalletContextValue {
  wallet: FreighterWallet;
  client: SentinelAIClient;
  isAuthenticated: boolean;
  userAddress: string | null;
  authenticate: () => Promise<boolean>;
  logout: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallet = useFreighterWallet();
  const [client] = useState(() => new SentinelAIClient(API_BASE));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (wallet.state.status !== "connected") return false;

    const publicKey = wallet.state.publicKey;

    try {
      // SEP-10 flow: get challenge, sign it, verify
      const challenge = await client.sep10Challenge(publicKey);

      // Sign the challenge message with Freighter
      const signature = await wallet.signMessage(challenge.message);

      // Verify with the server
      const authResponse = await client.sep10Verify(publicKey, signature, challenge.nonce);

      if (authResponse.success) {
        setIsAuthenticated(true);
        setUserAddress(publicKey);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Authentication failed:", err);
      return false;
    }
  }, [wallet.state, client, wallet.signMessage]);

  const logout = useCallback(() => {
    wallet.disconnect();
    setIsAuthenticated(false);
    setUserAddress(null);
  }, [wallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        client,
        isAuthenticated,
        userAddress,
        authenticate,
        logout,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
