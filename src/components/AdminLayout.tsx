
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Users, MessageSquare, CreditCard, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenBalance } from '@/components/TokenBalance';
import { logout } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'App', icon: Home },
    { path: '/admin', label: 'Users', icon: Users },
    { path: '/admin?tab=chat-sessions', label: 'Chat Sessions', icon: MessageSquare },
    { path: '/admin?tab=transactions', label: 'Transactions', icon: CreditCard },
    { path: '/user-data', label: 'My Data', icon: User },
  ];

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r shadow-sm border-border/40 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <TokenBalance variant="compact" />
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                location.pathname === item.path ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-6">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
