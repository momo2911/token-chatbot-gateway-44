
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, UserCircle } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';
import { login } from '@/utils/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
        const isAdmin = userDoc.exists() && userDoc.data().role === "admin";
        
        if (isAdmin) {
          toast({
            title: "Đăng nhập thành công",
            description: "Chào mừng quản trị viên!",
          });
          navigate('/admin');
        } else {
          toast({
            title: "Quyền truy cập bị từ chối",
            description: "Tài khoản của bạn không có quyền quản trị.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Lỗi",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi đăng nhập.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useDefaultAdmin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    toast({
      title: "Thông tin đăng nhập demo",
      description: "Đã điền thông tin tài khoản admin mẫu.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-accent/5">
      <div className="w-full max-w-md">
        <AuthCard
          title="Đăng nhập Quản trị viên"
          description="Đăng nhập với quyền quản trị"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@example.com"
              error={errors.email}
              required
              disabled={isLoading}
            />
            
            <FormInput
              id="password"
              label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              error={errors.password}
              required
              disabled={isLoading}
            />
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-border/40">
            <div className="text-center">
              <Button 
                variant="outline"
                onClick={useDefaultAdmin}
                className="w-full flex items-center justify-center"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                Sử dụng tài khoản demo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Email: admin@example.com | Mật khẩu: admin123
              </p>
            </div>
          </div>
        </AuthCard>
      </div>
    </div>
  );
};

export default AdminAuth;
