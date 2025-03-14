
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register, isAuthenticated, checkEmailVerification } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { useFormValidation } from '@/hooks/useFormValidation';
import { useLoginAttempts } from '@/hooks/useLoginAttempts';
import { useAdminUser } from '@/hooks/useAdminUser';

export const useAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get redirect path from location state or default to '/'
  const redirectPath = location.state?.from?.pathname || '/';

  // Use the smaller hooks
  const { errors, validateForm, setErrors } = useFormValidation(isLogin);
  const { 
    loginAttempts, 
    isLocked, 
    MAX_LOGIN_ATTEMPTS, 
    incrementLoginAttempts, 
    resetLoginAttempts, 
    checkLockStatus, 
    getRemainingLockTime 
  } = useLoginAttempts();
  const { createAdminUser } = useAdminUser();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      navigate(redirectPath);
    }
  }, [navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (checkLockStatus()) {
      return;
    }

    // Validate form
    const isValid = validateForm(
      email, 
      password, 
      isLogin ? undefined : name, 
      isLogin ? undefined : passwordConfirm
    );
    
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
        
        if (!result.success) {
          incrementLoginAttempts();
          
          // Check if this is due to unverified email
          if (result.needsVerification) {
            setShowVerifyEmail(true);
          }
        } else {
          // Reset login attempts on successful login
          resetLoginAttempts();
        }
      } else {
        result = await register(name, email, password);
        
        if (result.success) {
          setShowVerifyEmail(true);
          // Don't redirect after registration, show verify email screen
          toast({
            title: "Đăng ký thành công",
            description: "Vui lòng kiểm tra email để xác thực tài khoản của bạn.",
          });
        }
      }
      
      if (result.success && !showVerifyEmail && isLogin) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đến với Token Gateway!",
        });
        navigate(redirectPath);
      } else if (!result.success && !showVerifyEmail) {
        toast({
          title: "Lỗi",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      console.error('Auth error:', error);
      
      if (isLogin) {
        incrementLoginAttempts();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    if (!isLogin) {
      setPasswordConfirm('');
    }
    setShowResetPassword(false);
    setShowVerifyEmail(false);
  };
  
  const handleForgotPassword = () => {
    setShowResetPassword(true);
  };
  
  const handleBackToLogin = () => {
    setShowResetPassword(false);
    setShowVerifyEmail(false);
    setIsLogin(true); // Ensure we're in login mode when returning
  };

  return {
    isLogin,
    isLoading,
    isLocked,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    errors,
    loginAttempts,
    MAX_LOGIN_ATTEMPTS,
    showResetPassword,
    showVerifyEmail,
    handleSubmit,
    createAdminUser,
    getRemainingLockTime,
    toggleAuthMode,
    handleForgotPassword,
    handleBackToLogin
  };
};
