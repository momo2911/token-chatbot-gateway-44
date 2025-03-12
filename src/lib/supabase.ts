
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with public environment variables
// These are safe to expose in browser code
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Define user profile type for type safety
export type UserProfile = {
  id: string;
  created_at?: string;
  user_id: string;
  name: string;
  email: string;
  tokens: number;
  plan: string;
}

// Define usage history type
export type UsageHistory = {
  id: string;
  created_at: string;
  user_id: string;
  tokens_used: number;
  cost: number;
  description?: string;
}

// Function to get user profile from Supabase
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data as UserProfile;
}

// Function to get user usage history
export async function getUserUsageHistory(userId: string): Promise<UsageHistory[]> {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('usage_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching usage history:', error);
    return [];
  }
  
  return data as UsageHistory[];
}

// Function to update user tokens balance
export async function updateUserTokens(
  userId: string, 
  newBalance: number
): Promise<boolean> {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('profiles')
    .update({ tokens: newBalance })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating user tokens:', error);
    return false;
  }
  
  return true;
}

// Function to record token usage
export async function recordTokenUsage(
  userId: string,
  tokensUsed: number,
  description: string = 'AI conversation'
): Promise<boolean> {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('usage_history')
    .insert({
      user_id: userId,
      tokens_used: tokensUsed,
      cost: tokensUsed,
      description
    });
    
  if (error) {
    console.error('Error recording token usage:', error);
    return false;
  }
  
  return true;
}
