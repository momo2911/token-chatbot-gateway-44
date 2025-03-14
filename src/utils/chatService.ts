
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export async function getChatMessages(chatHistoryId: string): Promise<ChatMessage[]> {
  try {
    const q = query(
      collection(db, "chatMessages"),
      where("chatHistoryId", "==", chatHistoryId),
      orderBy("timestamp", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as ChatMessage[];
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return [];
  }
}

export async function addChatMessage(
  chatHistoryId: string, 
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<ChatMessage | null> {
  try {
    const newMessage = {
      ...message,
      chatHistoryId,
      timestamp: new Date()
    };
    
    const docRef = await addDoc(collection(db, "chatMessages"), newMessage);
    
    // Update the message count in chat history
    const historyRef = doc(db, "chatHistories", chatHistoryId);
    const historyDoc = await getDoc(historyRef);
    
    if (historyDoc.exists()) {
      const currentCount = historyDoc.data().messageCount || 0;
      await updateDoc(historyRef, { 
        messageCount: currentCount + 1,
        updatedAt: new Date()
      });
    }
    
    return {
      id: docRef.id,
      ...newMessage,
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error adding chat message:", error);
    return null;
  }
}

export async function updateChatTitle(chatHistoryId: string, firstUserMessage: string): Promise<void> {
  try {
    // Only update if the title is the default "New Chat"
    const historyRef = doc(db, "chatHistories", chatHistoryId);
    const historyDoc = await getDoc(historyRef);
    
    if (historyDoc.exists() && historyDoc.data().title === "Cuộc trò chuyện mới") {
      // Generate a title from the first message
      const title = firstUserMessage.length > 30 
        ? `${firstUserMessage.substring(0, 30)}...` 
        : firstUserMessage;
        
      await updateDoc(historyRef, { 
        title,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error("Error updating chat title:", error);
  }
}
