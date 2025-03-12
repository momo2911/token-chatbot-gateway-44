
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAllTransactions } from '@/utils/admin';
import { formatCurrency } from '@/lib/utils';

export function AdminTransactionsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: getAllTransactions,
  });

  const filteredTransactions = transactions.filter((transaction: any) => 
    transaction.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setViewDialogOpen(true);
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
        <CardTitle className="text-xl">Transactions</CardTitle>
        <CardDescription>View all token purchases and usage history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by user or transaction ID..."
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.userEmail || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[120px]">{transaction.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell>
                        {transaction.type === 'purchase' ? (
                          <Badge className="bg-green-500">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Purchase
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            Usage
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'purchase' 
                          ? `${formatCurrency(transaction.amount)} / ${transaction.tokens} tokens` 
                          : `${transaction.tokens} tokens`
                        }
                      </TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'outline'}
                          className={
                            transaction.status === 'completed' 
                              ? 'bg-green-500' 
                              : transaction.status === 'pending' 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* View Transaction Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View detailed information about this transaction
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-xs">{selectedTransaction.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{formatDate(selectedTransaction.date)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">User</p>
                  <p>{selectedTransaction.userEmail || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedTransaction.userId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={selectedTransaction.status === 'completed' ? 'default' : 'outline'}
                    className={
                      selectedTransaction.status === 'completed' 
                        ? 'bg-green-500' 
                        : selectedTransaction.status === 'pending' 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className={selectedTransaction.type === 'purchase' ? 'bg-green-500' : ''}>
                    {selectedTransaction.type === 'purchase' ? 'Purchase' : 'Usage'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  {selectedTransaction.type === 'purchase' ? (
                    <>
                      <p>{formatCurrency(selectedTransaction.amount)}</p>
                      <p className="text-sm text-muted-foreground">{selectedTransaction.tokens} tokens</p>
                    </>
                  ) : (
                    <p>{selectedTransaction.tokens} tokens</p>
                  )}
                </div>
              </div>
              
              {selectedTransaction.paymentMethod && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                </div>
              )}
              
              {selectedTransaction.notes && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
