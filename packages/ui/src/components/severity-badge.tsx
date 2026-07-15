import React from "react";
import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { Severity } from "@sentinelai/shared";

interface SeverityBadgeProps {
  severity: Severity;
  size?: "sm" | "md";
  className?: string;
}

const severityConfig: Record<Severity, { color: "red" | "orange" | "yellow" | "blue" | "purple" | "gray"; label: string }> = {
  [Severity.CRITICAL]: { color: "red", label: "CRITICAL" },
  [Severity.HIGH]: { color: "orange", label: "HIGH" },
  [Severity.MEDIUM]: { color: "yellow", label: "MEDIUM" },
  [Severity.LOW]: { color: "blue", label: "LOW" },
  [Severity.INFO]: { color: "gray", label: "INFO" },
  [Severity.GAS]: { color: "purple", label: "GAS" },
};

export function SeverityBadge({ severity, size = "md", className }: SeverityBadgeProps) {
  const config = severityConfig[severity] ?? severityConfig[Severity.INFO];

  return (
    <Badge variant="glow" color={config.color} size={size} className={className}>
      {config.label}
    </Badge>
  );
}
