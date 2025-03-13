
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { getUserData } from '@/utils/auth';
import { getAllChatSessions } from '@/utils/admin';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { auth } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';

export default function UserData() {
  const [userData, setUserData] = useState<any>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get basic user data
        const data = await getUserData();
        setUserData(data);
        
        // Get chat sessions if available
        if (auth.currentUser) {
          const sessions = await getAllChatSessions();
          // Filter sessions for current user
          const userSessions = sessions.filter(
            (session) => session.userId === auth.currentUser?.uid
          );
          setChatSessions(userSessions);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">User Data</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="sessions">Chat Sessions</TabsTrigger>
            <TabsTrigger value="tokens">Token Usage</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Your basic account information</CardDescription>
              </CardHeader>
              <CardContent>
                {userData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p>{userData.name}</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p>{userData.email}</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                        <p className="capitalize">{userData.role || 'user'}</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                        <p>{userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No profile data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Chat Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Chat Sessions</CardTitle>
                <CardDescription>Your conversation history</CardDescription>
              </CardHeader>
              <CardContent>
                {chatSessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chatSessions.map((session) => (
                        <TableRow key={session._id}>
                          <TableCell className="font-medium">{session._id.substring(0, 8)}...</TableCell>
                          <TableCell>{session.messages?.length || 0}</TableCell>
                          <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(session.updatedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No chat sessions available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Token Usage Tab */}
          <TabsContent value="tokens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Token Balance</CardTitle>
                <CardDescription>Current token balance and purchase history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Balance */}
                  <div className="bg-muted/50 p-6 rounded-lg text-center">
                    <div className="text-4xl font-bold mb-2">
                      {userData?.tokens?.toLocaleString() || 0}
                    </div>
                    <p className="text-muted-foreground">Available Tokens</p>
                  </div>
                  
                  {/* Transaction History */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Purchase History</h3>
                    <div className="rounded-md border">
                      {userData?.transactions && userData.transactions.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Tokens</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userData.transactions.map((transaction: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>{transaction.tokens}</TableCell>
                                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                                <TableCell>{transaction.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No purchase history available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
