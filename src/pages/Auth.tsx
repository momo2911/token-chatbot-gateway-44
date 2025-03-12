
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, isAuthenticated } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from 'lucide-react';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }
      
      if (result.success) {
        toast({
          title: isLogin ? "Đăng nhập thành công" : "Đăng ký thành công",
          description: "Chào mừng bạn đến với Token Gateway!",
        });
        navigate('/');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-accent/5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg glass-card overflow-hidden transform transition-all-500 animate-scale-in">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                AI
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">
              {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
            </h1>
            
            <p className="text-center text-muted-foreground mb-6">
              {isLogin 
                ? 'Đăng nhập để sử dụng Token Gateway' 
                : 'Tạo tài khoản để bắt đầu sử dụng Token Gateway'}
            </p>
            
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
                    className="w-full px-4 py-2 rounded-lg border border-border focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all-200"
                    placeholder="Nguyễn Văn A"
                    required={!isLogin}
                    disabled={isLoading}
                  />
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
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all-200"
                  placeholder="email@example.com"
                  required
                  disabled={isLoading}
                />
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
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all-200"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
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
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
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
