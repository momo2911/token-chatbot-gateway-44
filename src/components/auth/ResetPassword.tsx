
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import FormInput from './FormInput';
import { Button } from '@/components/ui/button';
import { sendResetPasswordEmail } from '@/utils/auth';
import { isValidEmail } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

const ResetPassword = ({ onBackToLogin }: ResetPasswordProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Email là bắt buộc');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    // Send reset email
    setIsLoading(true);
    try {
      const result = await sendResetPasswordEmail(email);
      
      if (result.success) {
        setEmailSent(true);
        toast({
          title: "Email đã được gửi",
          description: "Vui lòng kiểm tra hộp thư để đặt lại mật khẩu",
        });
      } else {
        setError(result.error || 'Không thể gửi email đặt lại mật khẩu');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {emailSent ? (
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">Email đã được gửi!</h3>
          <p className="text-muted-foreground">
            Chúng tôi đã gửi một email chứa đường dẫn đặt lại mật khẩu đến {email}. 
            Vui lòng kiểm tra hộp thư của bạn.
          </p>
          <Button 
            onClick={onBackToLogin}
            variant="outline"
            className="mt-2 w-full"
          >
            Quay lại đăng nhập
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nhập email của bạn dưới đây và chúng tôi sẽ gửi cho bạn một đường dẫn để đặt lại mật khẩu.
          </p>
          
          <FormInput
            id="reset-email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="email@example.com"
            error={error}
            required
            disabled={isLoading}
          />
          
          <div className="flex flex-col space-y-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Gửi email đặt lại mật khẩu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToLogin}
              className="w-full"
              disabled={isLoading}
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
