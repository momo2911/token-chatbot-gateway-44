
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import UserData from "./pages/UserData";
import NotFound from "./pages/NotFound";
import { isAuthenticated, onAuthStateChange, refreshAuthToken, isTokenExpired } from "./utils/auth";
import { auth, db } from "./lib/firebase";
import { useToast } from "./hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";

const queryClient = new QueryClient();

// Component that needs access to router hooks
const AppContent = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle authentication state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setAuthChecked(true);
    });

    // Set up token refresh interval
    const refreshInterval = setInterval(async () => {
      if (isAuthenticated() && isTokenExpired()) {
        const newToken = await refreshAuthToken();
        if (!newToken) {
          toast({
            title: "Phiên làm việc hết hạn",
            description: "Vui lòng đăng nhập lại để tiếp tục.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate, toast]);

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authChecked) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>;
    }
    
    if (!user && !isAuthenticated()) {
      return <Navigate to="/auth" state={{ from: location }} />;
    }
    
    return <>{children}</>;
  };

  // Admin route component
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const checkAdminStatus = async () => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            setIsAdminUser(userDoc.exists() && userDoc.data().role === "admin");
          } catch (error) {
            console.error("Error checking admin status:", error);
          } finally {
            setChecking(false);
          }
        } else {
          setChecking(false);
        }
      };
      
      checkAdminStatus();
    }, [user]);

    if (!authChecked || checking) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>;
    }
    
    if (!user || !isAuthenticated()) {
      return <Navigate to="/auth" state={{ from: location }} />;
    }
    
    if (!isAdminUser) {
      toast({
        title: "Quyền truy cập bị từ chối",
        description: "Bạn không có quyền truy cập vào khu vực quản trị.",
        variant: "destructive",
      });
      return <Navigate to="/" />;
    }
    
    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/auth" element={<Auth />} />
      <Route path="/account" element={
        <ProtectedRoute>
          <Account />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/user-data" element={
        <ProtectedRoute>
          <UserData />
        </ProtectedRoute>
      } />
      <Route path="/logout" element={
        <Navigate to="/auth" replace={true} />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
