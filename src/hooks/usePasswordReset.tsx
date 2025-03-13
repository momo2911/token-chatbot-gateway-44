
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { sendResetPasswordEmail } from '@/utils/auth';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();
  
  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      setErrorMessage('Email là bắt buộc');
      return false;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = await sendResetPasswordEmail(email);
      
      if (result.success) {
        setSuccessMessage('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
        toast({
          title: "Email đã được gửi",
          description: "Vui lòng kiểm tra hộp thư để đặt lại mật khẩu",
        });
        return true;
      } else {
        setErrorMessage(result.error || 'Không thể gửi email đặt lại mật khẩu');
        toast({
          title: "Lỗi",
          description: result.error || "Không thể gửi email đặt lại mật khẩu",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrorMessage('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    errorMessage,
    successMessage,
    resetPassword,
    setErrorMessage,
    setSuccessMessage
  };
};
