
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TokenBalance } from "./TokenBalance";
import { 
  MessageCircle, 
  User, 
  LogOut, 
  Menu,
  X,
  Settings
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { logout } from "@/utils/auth";
import { toast } from "@/hooks/use-toast";
import { ChatHistoryList } from "./ChatHistoryList";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    
    return () => unsubscribe();
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Thành công",
        description: "Đã đăng xuất thành công",
        variant: "default",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi đăng xuất",
        variant: "destructive",
      });
    }
  };
  
  const navigation = [
    { name: 'Tài khoản', href: '/account', icon: User },
    { name: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full glass shadow-subtle border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              AI
            </div>
            <span className="text-xl font-medium">Token Gateway</span>
          </Link>
          
          {isLoggedIn && (
            <div className="hidden md:flex items-center space-x-4">
              <TokenBalance />
              <Link 
                to="/account"
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all-200 hover:bg-accent/10"
              >
                Mua token
              </Link>
            </div>
          )}
          
          {isMobile && (
            <button onClick={toggleMenu} className="p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </header>
      
      <div 
        className={cn(
          "fixed inset-0 z-40 transform transition-all-300 lg:hidden",
          isMenuOpen 
            ? "translate-x-0 opacity-100" 
            : "translate-x-full opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" onClick={closeMenu} />
        <div className="absolute right-0 top-0 h-full w-64 glass shadow-lg border-l border-border/40 p-4 flex flex-col animate-slide-in">
          <div className="flex flex-col space-y-2 mt-14">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md transition-all-200",
                  location.pathname === item.href
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-accent/5 text-foreground"
                )}
                onClick={closeMenu}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {isLoggedIn && (
              <>
                <div className="mt-4 px-4 py-2">
                  <TokenBalance />
                </div>
                <button
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-destructive hover:bg-destructive/5 transition-all-200"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {isLoggedIn && !isMobile && (
          <aside className="w-64 flex-shrink-0 flex-col border-r border-border/40 flex">
            <div className="flex-1 overflow-y-auto">
              {location.pathname === '/' ? (
                <ChatHistoryList />
              ) : (
                <nav className="px-4 py-6 space-y-1">
                  <Link
                    to="/"
                    className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all-200 text-base hover:bg-accent/5 text-foreground"
                  >
                    <MessageCircle size={18} />
                    <span>Cuộc trò chuyện</span>
                  </Link>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-md transition-all-200 text-base",
                        location.pathname === item.href
                          ? "bg-accent/10 text-accent font-medium"
                          : "hover:bg-accent/5 text-foreground"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            
            <div className="p-4 border-t border-border/40">
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-muted-foreground hover:bg-accent/5 transition-all-200"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>
        )}
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-5xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
