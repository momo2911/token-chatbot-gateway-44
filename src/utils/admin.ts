
import { auth } from '@/lib/firebase';
import { getAuthToken } from './auth';

// API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Check if current user is an admin
export async function isAdmin(): Promise<boolean> {
  try {
    // This is a mock implementation. In a real app, you'd check against your backend
    // where you'd have proper role-based access control
    const userId = auth.currentUser?.uid;
    const email = auth.currentUser?.email;
    
    if (!userId || !email) return false;
    
    // For this demo, we'll consider any user with an email containing "admin" as an admin
    // In a real app, you'd check with your backend for proper role verification
    return email.includes('admin');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Get all users - admin only
export async function getAllUsers(): Promise<any[]> {
  try {
    // In a real app, this would be an API call to your backend
    // For this demo, we'll return mock data
    return [
      {
        uid: '1',
        email: 'admin@example.com',
        displayName: 'Admin User',
        tokens: 500,
        isAdmin: true,
      },
      {
        uid: '2',
        email: 'user1@example.com',
        displayName: 'Test User 1',
        tokens: 100,
        isAdmin: false,
      },
      {
        uid: '3',
        email: 'user2@example.com',
        displayName: 'Test User 2',
        tokens: 250,
        isAdmin: false,
      }
    ];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Update user tokens - admin only
export async function updateUserTokens(userId: string, tokens: number): Promise<boolean> {
  try {
    // In a real app, this would be an API call to your backend
    console.log(`Updating tokens for user ${userId} to ${tokens}`);
    // Simulate API call success
    return true;
  } catch (error) {
    console.error('Error updating user tokens:', error);
    throw error;
  }
}

// Update user role - admin only
export async function updateUserRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
  try {
    // In a real app, this would be an API call to your backend
    console.log(`Updating role for user ${userId} to ${role}`);
    // Simulate API call success
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Delete user - admin only
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // In a real app, this would be an API call to your backend
    console.log(`Deleting user ${userId}`);
    // Simulate API call success
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Get all chat sessions - admin only
export async function getAllChatSessions(): Promise<any[]> {
  try {
    // In a real app, this would be an API call to your backend that fetches from MongoDB
    // For this demo, we'll return mock data
    return [
      {
        _id: '1',
        userId: '2',
        userEmail: 'user1@example.com',
        messages: [
          { role: 'user', content: 'Hello AI', timestamp: new Date().toISOString() },
          { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: new Date().toISOString() },
          { role: 'user', content: 'Tell me about AI', timestamp: new Date().toISOString() },
          { role: 'assistant', content: 'Artificial Intelligence (AI) refers to systems designed to perform tasks that typically require human intelligence...', timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        userId: '3',
        userEmail: 'user2@example.com',
        messages: [
          { role: 'user', content: 'How do I use this app?', timestamp: new Date().toISOString() },
          { role: 'assistant', content: 'This is a token-based AI chat application. You can purchase tokens and use them to chat with the AI...', timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
}

// Delete chat session - admin only
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    // In a real app, this would be an API call to your backend
    console.log(`Deleting chat session ${sessionId}`);
    // Simulate API call success
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

// Get all transactions - admin only
export async function getAllTransactions(): Promise<any[]> {
  try {
    // In a real app, this would be an API call to your backend
    // For this demo, we'll return mock data
    return [
      {
        id: 'txn_1234567890',
        userId: '2',
        userEmail: 'user1@example.com',
        type: 'purchase',
        amount: 20000,
        tokens: 100,
        status: 'completed',
        paymentMethod: 'credit_card',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
      {
        id: 'txn_0987654321',
        userId: '3',
        userEmail: 'user2@example.com',
        type: 'purchase',
        amount: 50000,
        tokens: 250,
        status: 'completed',
        paymentMethod: 'bank_transfer',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 'use_1234567890',
        userId: '2',
        userEmail: 'user1@example.com',
        type: 'usage',
        tokens: 15,
        status: 'completed',
        date: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      },
      {
        id: 'txn_5432167890',
        userId: '3',
        userEmail: 'user2@example.com',
        type: 'purchase',
        amount: 10000,
        tokens: 50,
        status: 'pending',
        paymentMethod: 'e_wallet',
        date: new Date().toISOString(), // Now
      }
    ];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}
