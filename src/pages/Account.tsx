
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { getUserData, purchaseTokens, isAuthenticated } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { AccountTokenBalance } from '@/components/account/TokenBalance';
import { TokenPackages } from '@/components/account/TokenPackages';
import { UsageHistory } from '@/components/account/UsageHistory';
import { UsageStatistics } from '@/components/account/UsageStatistics';

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
  const [selectedTokenAmount, setSelectedTokenAmount] = useState(100);
  const [isPurchasing, setIsPurchasing] = useState(false);
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

  const handlePurchase = async () => {
    setIsPurchasing(true);
    
    try {
      const selectedPackage = tokenPackages.find(p => p.amount === selectedTokenAmount);
      if (!selectedPackage) return;
      
      const result = await purchaseTokens(selectedTokenAmount, 'credit_card');
      
      if (result.success) {
        toast({
          title: "Mua token thành công",
          description: `Bạn đã mua thành công ${selectedTokenAmount} token.`,
        });
        
        // Update the local userData state
        if (userData) {
          setUserData({
            ...userData,
            tokens: result.newBalance || userData.tokens + selectedTokenAmount,
          });
        }
      } else {
        toast({
          title: "Lỗi mua token",
          description: result.error || "Không thể mua token. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Purchase error', error);
      toast({
        title: "Lỗi giao dịch",
        description: "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
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
        
        <AccountTokenBalance 
          tokens={userData.tokens}
          isPurchasing={isPurchasing}
          handlePurchase={handlePurchase}
        />
        
        <TokenPackages 
          packages={tokenPackages}
          selectedAmount={selectedTokenAmount}
          onSelectAmount={setSelectedTokenAmount}
        />
        
        <UsageHistory history={userData.usageHistory} />
        
        <UsageStatistics />
      </div>
    </Layout>
  );
};

export default Account;
