
import { getAuthToken } from './auth';

// API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/payments';

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  tokens: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

export interface ProcessPaymentParams {
  amount: number;
  tokens: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'e_wallet';
}

export async function processPayment(params: ProcessPaymentParams): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  try {
    // Get the current user ID
    const userId = 'current-user'; // In a real app, get this from auth

    const response = await fetch(`${API_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        ...params,
        userId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment processing failed');
    }
    
    const data = await response.json();
    return {
      success: true,
      transactionId: data.transactionId
    };
  } catch (error) {
    console.error('Payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown payment error'
    };
  }
}

export async function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
  try {
    // Get the current user ID
    const userId = 'current-user'; // In a real app, get this from auth
    
    const response = await fetch(`${API_URL}/history/${userId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}
