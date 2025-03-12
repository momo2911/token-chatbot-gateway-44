
// This is a placeholder implementation. In a real application, this would interact with a real authentication system

// Simple token management for demo purposes
export function saveAuthToken(token: string): void {
  localStorage.setItem('token', token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function removeAuthToken(): void {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Mock login function
export async function login(
  email: string, 
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo: accept any login with a password of at least 6 characters
      if (email && password && password.length >= 6) {
        const token = `demo-token-${Math.random().toString(36).substring(2, 15)}`;
        saveAuthToken(token);
        resolve({ success: true, token });
      } else {
        resolve({ 
          success: false, 
          error: "Thông tin đăng nhập không hợp lệ"
        });
      }
    }, 1000);
  });
}

// Mock registration function
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo: any valid-looking inputs are accepted
      if (name && email && password && password.length >= 6) {
        const token = `demo-token-${Math.random().toString(36).substring(2, 15)}`;
        saveAuthToken(token);
        resolve({ success: true, token });
      } else {
        resolve({ 
          success: false, 
          error: "Vui lòng điền đầy đủ thông tin và mật khẩu ít nhất 6 ký tự" 
        });
      }
    }, 1000);
  });
}

// Mock function to get user data
export async function getUserData(): Promise<any> {
  // In a real app, this would fetch the user's profile from an API
  return {
    name: "Người dùng Demo",
    email: "demo@example.com",
    tokens: 100,
    plan: "Cơ bản",
    usageHistory: [
      { date: "2023-10-01", tokensUsed: 25, cost: 25 },
      { date: "2023-10-02", tokensUsed: 30, cost: 30 },
      { date: "2023-10-03", tokensUsed: 15, cost: 15 },
    ]
  };
}

// Mock function to purchase tokens
export async function purchaseTokens(
  amount: number, 
  paymentMethod: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // Simulate API call for token purchase
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo: always succeed
      resolve({ 
        success: true, 
        newBalance: 100 + amount // Assume starting balance of 100
      });
    }, 1500);
  });
}
