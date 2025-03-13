
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register, isAuthenticated } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isValidEmail, isStrongPassword } from '@/utils/validation';

export const useAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

  // Get redirect path from location state or default to '/'
  const redirectPath = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Check for stored lock time
    const storedLockTime = localStorage.getItem('auth_lock_time');
    if (storedLockTime) {
      const lockTimeValue = parseInt(storedLockTime, 10);
      if (lockTimeValue > Date.now()) {
        setIsLocked(true);
        setLockTime(lockTimeValue);
      } else {
        // Lock expired
        localStorage.removeItem('auth_lock_time');
        localStorage.removeItem('login_attempts');
      }
    }

    // Get stored login attempts
    const storedAttempts = localStorage.getItem('login_attempts');
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }

    // Redirect if already authenticated
    if (isAuthenticated()) {
      navigate(redirectPath);
    }

    // Lock countdown timer
    let interval: number | undefined;
    if (isLocked && lockTime) {
      interval = window.setInterval(() => {
        if (lockTime <= Date.now()) {
          setIsLocked(false);
          localStorage.removeItem('auth_lock_time');
          localStorage.removeItem('login_attempts');
          setLoginAttempts(0);
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [navigate, isLocked, lockTime, redirectPath]);

  const incrementLoginAttempts = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('login_attempts', newAttempts.toString());

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION;
      setIsLocked(true);
      setLockTime(lockUntil);
      localStorage.setItem('auth_lock_time', lockUntil.toString());
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      passwordConfirm?: string;
    } = {};
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu cần có ít nhất 6 ký tự";
      isValid = false;
    }

    // Registration specific validations
    if (!isLogin) {
      // Name validation
      if (!name.trim()) {
        newErrors.name = "Họ tên là bắt buộc";
        isValid = false;
      } else if (name.length < 2) {
        newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
        isValid = false;
      }

      // Password strength validation
      if (password && !isStrongPassword(password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa và 1 số";
        isValid = false;
      }

      // Password confirmation
      if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "Mật khẩu xác nhận không khớp";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Tài khoản tạm khóa",
        description: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
        
        if (!result.success) {
          incrementLoginAttempts();
        } else {
          // Reset login attempts on successful login
          localStorage.removeItem('login_attempts');
          setLoginAttempts(0);
        }
      } else {
        result = await register(name, email, password);
      }
      
      if (result.success) {
        toast({
          title: isLogin ? "Đăng nhập thành công" : "Đăng ký thành công",
          description: "Chào mừng bạn đến với Token Gateway!",
        });
        navigate(redirectPath);
      } else {
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

  // Function to create an admin user for testing
  const createAdminUser = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập trước",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
        role: "admin",
        tokens: 1000,
        createdAt: new Date()
      });
      
      toast({
        title: "Thành công",
        description: "Tài khoản của bạn đã được nâng cấp lên admin",
      });
      
      navigate('/admin');
    } catch (error) {
      console.error("Error creating admin:", error);
      toast({
        title: "Lỗi",
        description: "Không thể nâng cấp tài khoản",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate remaining lock time in minutes and seconds
  const getRemainingLockTime = (): string => {
    if (!lockTime) return '';
    
    const remainingMs = Math.max(0, lockTime - Date.now());
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    if (!isLogin) {
      setPasswordConfirm('');
    }
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
    handleSubmit,
    createAdminUser,
    getRemainingLockTime,
    toggleAuthMode
  };
};
