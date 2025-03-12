
import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

// Get all users - admin only
export async function getAllUsers(): Promise<any[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      isAdmin: doc.data().role === "admin"
    }));
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Update user tokens - admin only
export async function updateUserTokens(userId: string, tokens: number): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { tokens });
    return true;
  } catch (error) {
    console.error('Error updating user tokens:', error);
    throw error;
  }
}

// Update user role - admin only
export async function updateUserRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Delete user - admin only
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Get all chat sessions - admin only
export async function getAllChatSessions(): Promise<any[]> {
  try {
    const chatSessionsSnapshot = await getDocs(collection(db, "chatSessions"));
    
    return chatSessionsSnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
}

// Delete chat session - admin only
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId);
    await deleteDoc(sessionRef);
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

// Get all transactions - admin only
export async function getAllTransactions(): Promise<any[]> {
  try {
    const transactionsSnapshot = await getDocs(collection(db, "transactions"));
    
    return transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}
