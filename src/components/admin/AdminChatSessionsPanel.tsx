
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Trash } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAllChatSessions, deleteChatSession } from '@/utils/admin';
import { useToast } from '@/components/ui/use-toast';

export function AdminChatSessionsPanel() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-chat-sessions'],
    queryFn: getAllChatSessions,
  });

  const filteredSessions = sessions.filter((session: any) => 
    session.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setViewDialogOpen(true);
  };

  const handleDeleteSession = (session: any) => {
    setSelectedSession(session);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteChatSession(selectedSession._id);
      toast({
        title: "Success",
        description: "Chat session deleted successfully",
      });
      refetch();
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Chat Sessions</CardTitle>
        <CardDescription>View and manage user chat sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by user ID or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No chat sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session: any) => (
                    <TableRow key={session._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.userEmail || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{session.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{session.messages?.length || 0} messages</Badge>
                      </TableCell>
                      <TableCell>{formatDate(session.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSession(session)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteSession(session)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* View Chat Session Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chat Session Details</DialogTitle>
            <DialogDescription>
              User: {selectedSession?.userEmail || selectedSession?.userId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedSession?.messages?.map((message: any, index: number) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary-foreground ml-auto max-w-[80%]' 
                    : 'bg-muted max-w-[80%]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <Badge variant={message.role === 'user' ? 'default' : 'outline'}>
                    {message.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}

            {(!selectedSession?.messages || selectedSession.messages.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No messages in this session
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Session Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p><strong>User:</strong> {selectedSession?.userEmail || selectedSession?.userId}</p>
            <p><strong>Messages:</strong> {selectedSession?.messages?.length || 0}</p>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
