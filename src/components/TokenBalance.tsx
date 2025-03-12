
import React, { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface TokenBalanceProps {
  className?: string;
  variant?: "default" | "compact";
}

export function TokenBalance({ className, variant = "default" }: TokenBalanceProps) {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('tokens')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching token balance:', error);
          setIsLoading(false);
          return;
        }
        
        setBalance(data.tokens);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
    
    // Set up a subscription to update the balance in real-time
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          if (payload.new && 'tokens' in payload.new) {
            setBalance(payload.new.tokens as number);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
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
        <span className="animate-pulse">---</span>
      ) : (
        <span>{balance.toLocaleString()} Token</span>
      )}
    </div>
  );
}
