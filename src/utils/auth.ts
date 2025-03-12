
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Token management for local storage backup
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
  return auth.currentUser !== null || !!getAuthToken();
}

// Firebase login function
export async function login(
  email: string, 
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    saveAuthToken(token);
    return { success: true, token };
  } catch (error: any) {
    console.error('Login error:', error);
    let errorMessage = "Thông tin đăng nhập không hợp lệ";
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = "Email hoặc mật khẩu không đúng";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau";
    }
    
    return { success: false, error: errorMessage };
  }
}

// Firebase registration function
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with the user's name
    await updateProfile(userCredential.user, { 
      displayName: name 
    });
    
    const token = await userCredential.user.getIdToken();
    saveAuthToken(token);
    
    // Create user document with role in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      role: "user", // Default role for new users
      tokens: 100, // Initial tokens
      createdAt: new Date()
    });
    
    return { success: true, token };
  } catch (error: any) {
    console.error('Registration error:', error);
    let errorMessage = "Đăng ký không thành công";
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email đã được sử dụng";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email không hợp lệ";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự";
    }
    
    return { success: false, error: errorMessage };
  }
}

// Firebase logout function
export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    removeAuthToken();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Mock function to get user data - this would connect to your database in a real app
export async function getUserData(): Promise<any> {
  if (!auth.currentUser) {
    return null;
  }
  
  try {
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      // Fallback if no document exists
      return {
        name: auth.currentUser.displayName || "Người dùng",
        email: auth.currentUser.email,
        tokens: 100,
        role: "user",
        plan: "Cơ bản"
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      name: auth.currentUser.displayName || "Người dùng",
      email: auth.currentUser.email,
      tokens: 100,
      role: "user",
      plan: "Cơ bản"
    };
  }
}

// Updated to integrate with payment system
export async function purchaseTokens(
  amount: number, 
  paymentMethod: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // This function is now deprecated - use the payment system instead
  console.warn("purchaseTokens in auth.ts is deprecated. Use the payment system instead.");
  
  return { 
    success: true, 
    newBalance: 100 + amount // Assume starting balance of 100
  };
}

// Set up auth state listener
export function onAuthStateChange(callback: (user: any) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Check if current user is an admin
export async function isAdmin(): Promise<boolean> {
  try {
    if (!auth.currentUser) return false;
    
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data().role === "admin";
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
