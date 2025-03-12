
import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Receipt, Clock, ArrowDownToLine, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPaymentHistory, PaymentHistoryItem } from "@/utils/payment";

export function PaymentHistory() {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getPaymentHistory();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Bạn chưa có giao dịch nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Mua {item.tokens} token</CardTitle>
              <CardDescription>{formatDate(item.date)}</CardDescription>
            </div>
            <div className="bg-secondary/30 p-2 rounded-full">
              {item.status === 'completed' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Clock className="h-6 w-6 text-yellow-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Số tiền:</span>
              <span className="font-medium">{formatCurrency(item.amount)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-muted-foreground">Mã giao dịch:</span>
              <span className="text-sm font-mono">{item.id}</span>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-2 pb-2 px-6 flex justify-between">
            <span className="text-xs text-muted-foreground flex items-center">
              <Receipt className="h-3 w-3 mr-1" />
              Hoàn tất
            </span>
            <button className="text-xs text-accent flex items-center">
              <ArrowDownToLine className="h-3 w-3 mr-1" />
              Tải hóa đơn
            </button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
