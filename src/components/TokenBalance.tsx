
import React from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenBalanceProps {
  className?: string;
  variant?: "default" | "compact";
}

export function TokenBalance({ className, variant = "default" }: TokenBalanceProps) {
  // This would normally come from an API or state management
  const [balance, setBalance] = React.useState(100);
  
  return (
    <div 
      className={cn(
        "flex items-center rounded-full glass-card px-3 py-1.5 text-sm font-medium transition-all-200 hover:shadow-glass-md",
        variant === "compact" ? "text-xs py-1 px-2" : "",
        className
      )}
    >
      <Coins size={variant === "compact" ? 14 : 16} className="text-accent mr-2" />
      <span>{balance.toLocaleString()} Token</span>
    </div>
  );
}
