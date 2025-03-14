
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, MoreVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useChatHistory, ChatHistoryItem } from '@/hooks/useChatHistory';
import { cn } from '@/lib/utils';

export function ChatHistoryList() {
  const { 
    histories, 
    loading, 
    activeHistoryId, 
    setActiveHistoryId,
    createChatHistory,
    updateChatHistory,
    deleteChatHistory
  } = useChatHistory();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleNewChat = async () => {
    const newChatId = await createChatHistory("Cuộc trò chuyện mới");
    if (newChatId) {
      navigate('/?chatId=' + newChatId);
    }
  };

  const handleSelectHistory = (historyId: string) => {
    setActiveHistoryId(historyId);
    navigate('/?chatId=' + historyId);
  };

  const startEditing = (history: ChatHistoryItem) => {
    setEditingId(history.id);
    setEditingTitle(history.title);
  };

  const saveEditing = async () => {
    if (editingId && editingTitle.trim()) {
      await updateChatHistory(editingId, { title: editingTitle.trim() });
      setEditingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleDeleteHistory = async (id: string) => {
    await deleteChatHistory(id);
    if (histories.length > 0 && id === activeHistoryId) {
      // If the active history is deleted, select another one
      const nextHistory = histories.find(h => h.id !== id);
      if (nextHistory) {
        handleSelectHistory(nextHistory.id);
      } else {
        navigate('/');
      }
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3">
        <Button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 justify-center"
          variant="outline"
        >
          <Plus size={16} />
          <span>Cuộc trò chuyện mới</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        {loading ? (
          <div className="space-y-2 px-2 py-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : histories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Không có cuộc trò chuyện nào</p>
            <p className="text-sm">Nhấn "Cuộc trò chuyện mới" để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {histories.map(history => (
              <div 
                key={history.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  activeHistoryId === history.id 
                    ? "bg-accent/10 text-accent font-medium" 
                    : "hover:bg-accent/5 text-foreground"
                )}
              >
                {editingId === history.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <MessageCircle size={18} className="flex-shrink-0" />
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:outline-none p-0"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing();
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <div className="flex items-center">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={saveEditing}
                      >
                        <Check size={14} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={cancelEditing}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="flex-1 flex items-center gap-2 cursor-pointer overflow-hidden"
                      onClick={() => handleSelectHistory(history.id)}
                    >
                      <MessageCircle size={18} className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{history.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(history.updatedAt)} • {history.messageCount || 0} tin nhắn
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEditing(history)}>
                          <Pencil size={14} className="mr-2" />
                          Đổi tên
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteHistory(history.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
