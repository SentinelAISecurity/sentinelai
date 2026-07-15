import React from "react";
import { cn } from "../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm",
        hover && "transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/70 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5 border-b border-gray-700/50", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-t border-gray-700/50 bg-gray-900/30", className)}>{children}</div>;
}
