
import React from 'react';
import { TrendingUp } from 'lucide-react';

export const UsageStatistics = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="w-5 h-5 text-accent mr-2" />
        <h2 className="text-xl font-semibold">Thống kê sử dụng</h2>
      </div>
      
      <div className="text-center py-6 text-muted-foreground">
        Dữ liệu thống kê sẽ được hiển thị sau khi bạn bắt đầu sử dụng dịch vụ
      </div>
    </div>
  );
};
