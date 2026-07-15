import React from "react";
import { cn } from "../lib/utils";

interface BadgeProps {
  variant?: "default" | "outline" | "glow";
  color?: "red" | "orange" | "yellow" | "blue" | "green" | "purple" | "gray";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    glow: "shadow-red-500/10",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/10",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/10",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/10",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/30",
    glow: "shadow-green-500/10",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/10",
  },
  gray: {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/10",
  },
};

export function Badge({ variant = "default", color = "gray", size = "md", children, className }: BadgeProps) {
  const colors = colorMap[color] ?? colorMap.gray;

  const sizes = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  const variants = {
    default: cn(colors.bg, colors.text, "rounded-full"),
    outline: cn(colors.bg, colors.text, colors.border, "border rounded-full"),
    glow: cn(colors.bg, colors.text, colors.border, "border rounded-full", colors.glow, "shadow-lg"),
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full", sizes[size], variants[variant], className)}>
      {children}
    </span>
  );
}
