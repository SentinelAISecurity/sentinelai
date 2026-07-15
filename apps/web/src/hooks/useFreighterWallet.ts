"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAddress,
  signMessage as signFreighterMessage,
  isConnected as freighterIsConnected,
} from "@stellar/freighter-api";

export type WalletState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected"; publicKey: string }
  | { status: "not_installed" }
  | { status: "error"; message: string };

export interface FreighterWallet {
  state: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  isFreighterInstalled: () => boolean;
}

function checkFreighterInstalled(): boolean {
  return typeof window !== "undefined" && !!(window as any).freighterApi;
}

export function useFreighterWallet(): FreighterWallet {
  const [state, setState] = useState<WalletState>(() => {
    if (!checkFreighterInstalled()) {
      return { status: "not_installed" };
    }
    return { status: "disconnected" };
  });

  // Check existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!checkFreighterInstalled()) return;
      try {
        const { isConnected: connected } = await freighterIsConnected();
        if (connected) {
          const result = await getAddress();
          if (result?.address) {
            setState({ status: "connected", publicKey: result.address });
          }
        }
      } catch {
        // Silently fail — user hasn't connected yet
      }
    };
    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    if (!checkFreighterInstalled()) {
      setState({ status: "not_installed" });
      return;
    }

    setState({ status: "connecting" });

    try {
      const result = await getAddress();
      if (!result?.address) {
        setState({ status: "error", message: "No public key returned" });
        return;
      }
      setState({ status: "connected", publicKey: result.address });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setState({ status: "error", message });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ status: "disconnected" });
  }, []);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!checkFreighterInstalled()) {
        throw new Error("Freighter wallet not installed");
      }
      if (state.status !== "connected") {
        throw new Error("Wallet not connected");
      }

      const result = await signFreighterMessage(message);
      if (!result.signedMessage) {
        throw new Error("No signature returned from Freighter");
      }
      const signedMessage =
        typeof result.signedMessage === "string"
          ? result.signedMessage
          : Buffer.from(result.signedMessage).toString("base64");
      // Convert base64 signature to hex for backend compatibility
      const sigBytes = Uint8Array.from(atob(signedMessage), (c) => c.charCodeAt(0));
      return Array.from(sigBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    },
    [state.status],
  );

  const isFreighterInstalled = useCallback(() => {
    return checkFreighterInstalled();
  }, []);

  return {
    state,
    connect,
    disconnect,
    signMessage,
    isFreighterInstalled,
  };
}
