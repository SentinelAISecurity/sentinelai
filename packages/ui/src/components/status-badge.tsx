import React from "react";
import { Badge } from "./badge";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<string, { color: "green" | "yellow" | "blue" | "red" | "gray" | "orange"; label: string }> = {
  active: { color: "green", label: "Active" },
  inactive: { color: "gray", label: "Inactive" },
  pending: { color: "yellow", label: "Pending" },
  scanning: { color: "blue", label: "Scanning" },
  analyzing: { color: "blue", label: "Analyzing" },
  completed: { color: "green", label: "Completed" },
  failed: { color: "red", label: "Failed" },
  archived: { color: "gray", label: "Archived" },
  acknowledged: { color: "blue", label: "Acknowledged" },
  resolved: { color: "green", label: "Resolved" },
  suppressed: { color: "gray", label: "Suppressed" },
  deprecated: { color: "orange", label: "Deprecated" },
  paused: { color: "yellow", label: "Paused" },
};

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { color: "gray" as const, label: status };

  return (
    <Badge variant="outline" color={config.color} size={size} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full bg-${config.color}-400 animate-pulse`} />
      {config.label}
    </Badge>
  );
}
