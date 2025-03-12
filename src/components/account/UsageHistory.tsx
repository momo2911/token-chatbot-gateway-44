
import React, { useState } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface UsageHistoryItem {
  date: string;
  tokensUsed: number;
  cost: number;
}

interface UsageHistoryProps {
  history: UsageHistoryItem[];
}

export const UsageHistory = ({ history }: UsageHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="glass-card p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-accent mr-2" />
          <h2 className="text-xl font-semibold">Lịch sử sử dụng</h2>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-4">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Ngày</th>
                    <th className="text-right py-3 px-4">Token sử dụng</th>
                    <th className="text-right py-3 px-4">Chi phí</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.date}</td>
                      <td className="text-right py-3 px-4">{item.tokensUsed}</td>
                      <td className="text-right py-3 px-4">{item.cost} token</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Chưa có lịch sử sử dụng
            </div>
          )}
        </div>
      )}
    </div>
  );
};
