
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { AdminChatSessionsPanel } from '@/components/admin/AdminChatSessionsPanel';
import { AdminTransactionsPanel } from '@/components/admin/AdminTransactionsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isAdmin } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isAdmin();
        setIsAuthorized(adminStatus);
        
        if (!adminStatus) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges to access this page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Error",
          description: "Failed to verify admin status.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="chat-sessions">Chat Sessions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <AdminUsersPanel />
          </TabsContent>

          <TabsContent value="chat-sessions" className="space-y-4">
            <AdminChatSessionsPanel />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <AdminTransactionsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
