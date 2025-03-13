
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

export const useAdminUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return {
    isLoading,
    createAdminUser
  };
};
