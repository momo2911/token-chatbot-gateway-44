
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail, logout } from '@/utils/auth';
import { ArrowRight, MailCheck } from 'lucide-react';

interface VerifyEmailProps {
  email: string;
  onBackToLogin: () => void;
}

const VerifyEmail = ({ email, onBackToLogin }: VerifyEmailProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    
    setIsLoading(true);
    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        toast({
          title: "Email đã được gửi",
          description: "Vui lòng kiểm tra hộp thư để xác thực tài khoản",
        });
        setCooldown(60); // 60 seconds cooldown
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể gửi email xác thực",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onBackToLogin(); // Return to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackToSignIn = () => {
    handleLogout(); // Ensure logout happens before going back
  };

  return (
    <div className="space-y-6 text-center">
      <MailCheck className="h-12 w-12 mx-auto text-accent" />
      
      <h3 className="text-lg font-medium">Xác thực email của bạn</h3>
      
      <p className="text-muted-foreground">
        Chúng tôi đã gửi một email chứa đường dẫn xác thực đến <strong>{email}</strong>.
        Vui lòng kiểm tra hộp thư của bạn và nhấp vào đường dẫn để kích hoạt tài khoản.
      </p>
      
      <div className="space-y-2">
        <Button
          onClick={handleResendEmail}
          disabled={isLoading || cooldown > 0}
          className="w-full"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : cooldown > 0 ? (
            `Gửi lại sau (${cooldown}s)`
          ) : (
            <>
              Gửi lại email xác thực
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleBackToSignIn}
          className="w-full"
        >
          Quay lại đăng nhập
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Sau khi xác thực email, bạn có thể đăng nhập để sử dụng đầy đủ tính năng của hệ thống.
      </p>
    </div>
  );
};

export default VerifyEmail;
