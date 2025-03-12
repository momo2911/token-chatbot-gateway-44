
import { supabase, getUserProfile, type UserProfile } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Get auth token from session
export function getAuthToken(): string | null {
  const session = supabase.auth.getSession();
  return session ? 'active-session' : null;
}

// Remove auth token (sign out)
export async function removeAuthToken(): Promise<void> {
  await supabase.auth.signOut();
}

// Handle login with Supabase
export async function login(
  email: string, 
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message || "Thông tin đăng nhập không hợp lệ"
      };
    }
    
    if (data.user) {
      return { success: true, token: 'active-session' };
    } else {
      return { success: false, error: "Đăng nhập thất bại" };
    }
  } catch (e) {
    console.error('Login error:', e);
    return { 
      success: false, 
      error: "Đã xảy ra lỗi khi đăng nhập"
    };
  }
}

// Handle registration with Supabase
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // First register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (error) {
      return { 
        success: false, 
        error: error.message || "Đăng ký thất bại"
      };
    }
    
    if (data.user) {
      // Create a profile record for the new user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          name: name,
          email: email,
          tokens: 100, // Initial free tokens
          plan: 'Cơ bản'
        });
        
      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't return an error to the user, since their account was created
        // The profile can be created later
      }
      
      return { success: true, token: 'active-session' };
    } else {
      return { success: false, error: "Đăng ký thất bại" };
    }
  } catch (e) {
    console.error('Registration error:', e);
    return { 
      success: false, 
      error: "Đã xảy ra lỗi khi đăng ký"
    };
  }
}

// Get user data from Supabase
export async function getUserData(): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get user profile
    const profile = await getUserProfile(user.id);
    
    if (!profile) {
      // If profile doesn't exist yet (which can happen in some edge cases),
      // create a default one
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.user_metadata.name || 'Người dùng',
          email: user.email,
          tokens: 100,
          plan: 'Cơ bản'
        });
        
      if (error) {
        console.error('Error creating profile:', error);
        throw new Error('Failed to create user profile');
      }
      
      return {
        name: user.user_metadata.name || 'Người dùng',
        email: user.email,
        tokens: 100,
        plan: 'Cơ bản',
        usageHistory: []
      };
    }
    
    // Get user usage history
    const { data: usageHistory, error: historyError } = await supabase
      .from('usage_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (historyError) {
      console.error('Error fetching usage history:', historyError);
      throw new Error('Failed to fetch usage history');
    }
    
    // Format the usage history for the frontend
    const formattedHistory = usageHistory.map((item: any) => ({
      date: new Date(item.created_at).toLocaleDateString('vi-VN'),
      tokensUsed: item.tokens_used,
      cost: item.cost
    }));
    
    return {
      name: profile.name,
      email: profile.email,
      tokens: profile.tokens,
      plan: profile.plan,
      usageHistory: formattedHistory
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    toast({
      title: "Lỗi",
      description: "Không thể tải dữ liệu người dùng",
      variant: "destructive",
    });
    
    // Return default data to prevent UI errors
    return {
      name: "Người dùng",
      email: "",
      tokens: 0,
      plan: "Cơ bản",
      usageHistory: []
    };
  }
}

// Handle token purchase
export async function purchaseTokens(
  amount: number, 
  paymentMethod: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Người dùng chưa đăng nhập" };
    }
    
    // In a real application, this would integrate with a payment provider
    // like Stripe, VNPay, etc. For now, we'll simulate a successful payment
    
    // Get current user profile
    const profile = await getUserProfile(user.id);
    
    if (!profile) {
      return { success: false, error: "Không tìm thấy thông tin người dùng" };
    }
    
    // Calculate new balance
    const newBalance = profile.tokens + amount;
    
    // Update balance in the database
    const { error } = await supabase
      .from('profiles')
      .update({ tokens: newBalance })
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error updating token balance:', error);
      return { success: false, error: "Không thể cập nhật số dư token" };
    }
    
    // Record the purchase transaction
    const { error: historyError } = await supabase
      .from('usage_history')
      .insert({
        user_id: user.id,
        tokens_used: -amount, // Negative to indicate a purchase/credit
        cost: 0,
        description: `Mua ${amount} token`
      });
      
    if (historyError) {
      console.error('Error recording purchase:', historyError);
      // Don't return error to user since the balance was updated successfully
    }
    
    return { success: true, newBalance };
  } catch (error) {
    console.error('Purchase error:', error);
    return { 
      success: false, 
      error: "Đã xảy ra lỗi trong quá trình thanh toán"
    };
  }
}
