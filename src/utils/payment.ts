
import { secureApiPost, secureApiGet } from './api';

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
    const data = await secureApiPost('/payments/process', params);
    
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
    const data = await secureApiGet('/payments/history');
    return data.history || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}
