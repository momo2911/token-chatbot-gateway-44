
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, onAuthStateChange, refreshAuthToken, isTokenExpired } from "./utils/auth";
import { auth, db } from "./lib/firebase";
import { useToast } from "./hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loaded components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));
const UserData = lazy(() => import("./pages/UserData"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-full max-w-md space-y-4 p-4">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-32 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

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
      return <PageLoader />;
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
      return <PageLoader />;
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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
