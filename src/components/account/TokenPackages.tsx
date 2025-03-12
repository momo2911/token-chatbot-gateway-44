
import React from 'react';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TokenPackage {
  amount: number;
  price: number;
  label: string;
  featured: boolean;
}

interface TokenPackagesProps {
  packages: TokenPackage[];
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
}

export const TokenPackages = ({ packages, selectedAmount, onSelectAmount }: TokenPackagesProps) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center mb-4">
        <CreditCard className="w-5 h-5 text-accent mr-2" />
        <h2 className="text-xl font-semibold">Gói token</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div 
            key={pkg.amount}
            className={`relative p-6 rounded-lg border transition-all-200 cursor-pointer ${
              selectedAmount === pkg.amount 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/30'
            }`}
            onClick={() => onSelectAmount(pkg.amount)}
          >
            {pkg.featured && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full">
                Phổ biến nhất
              </div>
            )}
            
            <div className={`text-center ${pkg.featured ? 'pt-2' : ''}`}>
              <div className="text-2xl font-bold mb-1">
                {pkg.label}
              </div>
              <div className="text-lg font-medium text-muted-foreground mb-3">
                {formatCurrency(pkg.price)}
              </div>
              
              <div className="text-sm text-muted-foreground">
                ({formatCurrency(pkg.price / pkg.amount)} / token)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
