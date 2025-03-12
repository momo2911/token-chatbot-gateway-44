import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { getUserData, isAuthenticated } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from '@/lib/utils';
import { 
  CreditCard, 
  Coins, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentHistory } from '@/components/PaymentHistory';

interface UsageHistory {
  date: string;
  tokensUsed: number;
  cost: number;
}

interface UserData {
  name: string;
  email: string;
  tokens: number;
  plan: string;
  usageHistory: UsageHistory[];
}

const Account = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isPaymentHistoryExpanded, setIsPaymentHistoryExpanded] = useState(false);
  const [selectedTokenAmount, setSelectedTokenAmount] = useState(100);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Token package options
  const tokenPackages = [
    { amount: 100, price: 100000, label: "100 Token", featured: false },
    { amount: 500, price: 450000, label: "500 Token", featured: true },
    { amount: 1000, price: 850000, label: "1,000 Token", featured: false },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        navigate('/auth');
        return;
      }
      
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data', error);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handlePurchaseStart = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    // Update the local userData state with new token balance
    const selectedPackage = tokenPackages.find(p => p.amount === selectedTokenAmount);
    if (userData && selectedPackage) {
      setUserData({
        ...userData,
        tokens: userData.tokens + selectedPackage.amount,
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout>
        <div className="text-center">
          <p>Không thể tải thông tin tài khoản. Vui lòng thử lại sau.</p>
        </div>
      </Layout>
    );
  }

  const selectedPackage = tokenPackages.find(p => p.amount === selectedTokenAmount) || tokenPackages[0];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <div className="inline-block">
            <h3 className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground uppercase tracking-wider">
              Tài khoản
            </h3>
          </div>
          <h1 className="text-3xl font-bold mt-2">Quản lý tài khoản</h1>
          <p className="text-muted-foreground">
            Quản lý token và lịch sử sử dụng của bạn
          </p>
        </div>
        
        {/* Token Balance */}
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            <Coins className="w-5 h-5 text-accent mr-2" />
            <h2 className="text-xl font-semibold">Số dư token</h2>
          </div>
          
          <div className="flex flex-col items-center bg-secondary/40 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold mb-2">
              {userData.tokens.toLocaleString()}
            </div>
            <p className="text-muted-foreground">Token hiện có</p>
            
            <div className="mt-6 max-w-xs w-full">
              <button 
                onClick={handlePurchaseStart}
                className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-all-200 flex items-center justify-center"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Mua thêm token
              </button>
            </div>
          </div>
        </div>
        
        {/* Token Packages */}
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-accent mr-2" />
            <h2 className="text-xl font-semibold">Gói token</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tokenPackages.map((pkg) => (
              <div 
                key={pkg.amount}
                className={`relative p-6 rounded-lg border transition-all-200 cursor-pointer ${
                  selectedTokenAmount === pkg.amount 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border hover:border-accent/30'
                }`}
                onClick={() => setSelectedTokenAmount(pkg.amount)}
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
        
        {/* Payment History */}
        <div className="glass-card p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsPaymentHistoryExpanded(!isPaymentHistoryExpanded)}
          >
            <div className="flex items-center">
              <Receipt className="w-5 h-5 text-accent mr-2" />
              <h2 className="text-xl font-semibold">Lịch sử thanh toán</h2>
            </div>
            
            {isPaymentHistoryExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
          
          {isPaymentHistoryExpanded && (
            <div className="mt-4">
              <PaymentHistory />
            </div>
          )}
        </div>
        
        {/* Usage History */}
        <div className="glass-card p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          >
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-accent mr-2" />
              <h2 className="text-xl font-semibold">Lịch sử sử dụng</h2>
            </div>
            
            {isHistoryExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
          
          {isHistoryExpanded && (
            <div className="mt-4">
              {userData.usageHistory.length > 0 ? (
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
                      {userData.usageHistory.map((item, index) => (
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
        
        {/* Usage Statistics */}
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-accent mr-2" />
            <h2 className="text-xl font-semibold">Thống kê sử dụng</h2>
          </div>
          
          <div className="text-center py-6 text-muted-foreground">
            Dữ liệu thống kê sẽ được hiển thị sau khi bạn bắt đầu sử dụng dịch vụ
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        tokenAmount={selectedTokenAmount}
        price={selectedPackage?.price || 0}
        onSuccess={handlePaymentSuccess}
      />
    </Layout>
  );
};

export default Account;
