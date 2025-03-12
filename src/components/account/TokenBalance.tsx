
import React from 'react';
import { Coins } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TokenBalanceProps {
  tokens: number;
  isPurchasing: boolean;
  handlePurchase: () => void;
}

export const AccountTokenBalance = ({ tokens, isPurchasing, handlePurchase }: TokenBalanceProps) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center mb-4">
        <Coins className="w-5 h-5 text-accent mr-2" />
        <h2 className="text-xl font-semibold">Số dư token</h2>
      </div>
      
      <div className="flex flex-col items-center bg-secondary/40 p-6 rounded-lg text-center">
        <div className="text-4xl font-bold mb-2">
          {tokens.toLocaleString()}
        </div>
        <p className="text-muted-foreground">Token hiện có</p>
        
        <div className="mt-6 max-w-xs w-full">
          <button 
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-all-200 flex items-center justify-center"
          >
            {isPurchasing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Mua thêm token
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
