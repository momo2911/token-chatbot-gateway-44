
import { useState, useEffect } from 'react';
import { doc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUser } from './useUser';
import { useToast } from './use-toast';

export interface ChatHistoryItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  messageCount: number;
}

export function useChatHistory() {
  const [histories, setHistories] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Load chat histories
  const loadChatHistories = async () => {
    if (!user) {
      setHistories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, "chatHistories"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const loadedHistories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as ChatHistoryItem[];
      
      setHistories(loadedHistories);
    } catch (error) {
      console.error("Error loading chat histories:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử trò chuyện",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new chat history
  const createChatHistory = async (title: string = "New Chat"): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const newHistory = {
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.uid,
        messageCount: 0
      };
      
      const docRef = await addDoc(collection(db, "chatHistories"), newHistory);
      const newHistoryWithId = { id: docRef.id, ...newHistory } as ChatHistoryItem;
      
      setHistories(prev => [newHistoryWithId, ...prev]);
      setActiveHistoryId(docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error("Error creating chat history:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo cuộc trò chuyện mới",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update a chat history
  const updateChatHistory = async (id: string, data: Partial<ChatHistoryItem>) => {
    if (!user) return;
    
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, "chatHistories", id), updateData);
      
      setHistories(prev => 
        prev.map(history => 
          history.id === id 
            ? { ...history, ...updateData, updatedAt: new Date() } 
            : history
        )
      );
    } catch (error) {
      console.error("Error updating chat history:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật cuộc trò chuyện",
        variant: "destructive",
      });
    }
  };

  // Delete a chat history
  const deleteChatHistory = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "chatHistories", id));
      
      setHistories(prev => prev.filter(history => history.id !== id));
      
      if (activeHistoryId === id) {
        setActiveHistoryId(null);
      }
      
      toast({
        title: "Thành công",
        description: "Đã xóa cuộc trò chuyện",
      });
    } catch (error) {
      console.error("Error deleting chat history:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa cuộc trò chuyện",
        variant: "destructive",
      });
    }
  };

  // Load histories when user changes
  useEffect(() => {
    loadChatHistories();
  }, [user]);

  return {
    histories,
    loading,
    activeHistoryId,
    setActiveHistoryId,
    createChatHistory,
    updateChatHistory,
    deleteChatHistory,
    refreshHistories: loadChatHistories
  };
}
