
import React, { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserData } from "@/utils/auth";

interface TokenBalanceProps {
  className?: string;
  variant?: "default" | "compact";
  refreshTrigger?: number;
}

export function TokenBalance({ 
  className, 
  variant = "default", 
  refreshTrigger = 0 
}: TokenBalanceProps) {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          setBalance(userData.tokens);
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [refreshTrigger]);
  
  return (
    <div 
      className={cn(
        "flex items-center rounded-full glass-card px-3 py-1.5 text-sm font-medium transition-all-200 hover:shadow-glass-md",
        variant === "compact" ? "text-xs py-1 px-2" : "",
        className
      )}
    >
      <Coins size={variant === "compact" ? 14 : 16} className="text-accent mr-2" />
      {isLoading ? (
        <span className="w-8 h-3 bg-muted animate-pulse rounded"></span>
      ) : (
        <span>{balance.toLocaleString()} Token</span>
      )}
    </div>
  );
}
