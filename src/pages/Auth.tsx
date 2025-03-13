
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register, isAuthenticated } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isValidEmail } from '@/utils/validation';

const Auth = () => {
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
      if (password && !(/[A-Z]/.test(password) && /[0-9]/.test(password))) {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-accent/5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg glass-card overflow-hidden transform transition-all-500 animate-scale-in">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">
              {isLogin ? 'Đăng nhập An toàn' : 'Đăng ký tài khoản An toàn'}
            </h1>
            
            <p className="text-center text-muted-foreground mb-6">
              {isLogin 
                ? 'Đăng nhập để sử dụng Token Gateway' 
                : 'Tạo tài khoản để bắt đầu sử dụng Token Gateway'}
            </p>
            
            {isLocked ? (
              <div className="text-center p-4 mb-4 bg-destructive/10 rounded-lg">
                <p className="font-medium text-destructive mb-2">Tài khoản tạm khóa</p>
                <p className="text-sm text-muted-foreground">
                  Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau {getRemainingLockTime()}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Họ tên
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-destructive' : 'border-border'} focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all-200`}
                      placeholder="Nguyễn Văn A"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-destructive text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-destructive' : 'border-border'} focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all-200`}
                    placeholder="email@example.com"
                    required
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Mật khẩu
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-destructive' : 'border-border'} focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all-200`}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>
                
                {!isLogin && (
                  <div>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      id="passwordConfirm"
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.passwordConfirm ? 'border-destructive' : 'border-border'} focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all-200`}
                      placeholder="••••••••"
                      required={!isLogin}
                      disabled={isLoading}
                    />
                    {errors.passwordConfirm && (
                      <p className="text-destructive text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.passwordConfirm}
                      </p>
                    )}
                  </div>
                )}
                
                {isLogin && loginAttempts > 0 && (
                  <div className="text-xs text-muted-foreground text-right">
                    Số lần thử còn lại: {MAX_LOGIN_ATTEMPTS - loginAttempts}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading || isLocked}
                  className="w-full bg-accent hover:bg-accent/90 text-white py-3 rounded-lg font-medium transition-all-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  if (!isLogin) {
                    setPasswordConfirm('');
                  }
                }}
                className="text-accent hover:underline text-sm transition-all-200"
                disabled={isLoading}
              >
                {isLogin 
                  ? 'Chưa có tài khoản? Đăng ký ngay' 
                  : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  onClick={createAdminUser}
                  className="text-xs text-muted-foreground hover:text-accent transition-all-200"
                  disabled={isLoading}
                >
                  Tạo tài khoản admin (chỉ cho mục đích demo)
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Bằng việc đăng ký, bạn đồng ý với các <a href="#" className="text-accent hover:underline">Điều khoản Sử dụng</a> và <a href="#" className="text-accent hover:underline">Chính sách Bảo mật</a> của chúng tôi.
        </p>
      </div>
    </div>
  );
};

export default Auth;
