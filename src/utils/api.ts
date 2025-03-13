
import { getAuthToken, refreshAuthToken, isTokenExpired } from './auth';

// Base API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Secure fetch wrapper that handles authentication
 */
export async function secureApiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Check if token is expired and refresh if needed
  if (isTokenExpired()) {
    await refreshAuthToken();
  }
  
  // Get the current token
  const token = getAuthToken();
  
  // Prepare headers with authentication
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Prepare the request with authentication
  const secureOptions: RequestInit = {
    ...options,
    headers
  };
  
  // Make the authenticated request
  const response = await fetch(`${API_URL}${endpoint}`, secureOptions);
  
  // Handle 401 Unauthorized - token might be invalid or expired
  if (response.status === 401) {
    console.warn('Authentication error, attempting to refresh token...');
    
    // Try to refresh the token
    const newToken = await refreshAuthToken();
    
    // If token refresh was successful, retry the request
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(`${API_URL}${endpoint}`, {
        ...secureOptions,
        headers
      });
    }
  }
  
  return response;
}

/**
 * Helper function for making GET requests
 */
export async function secureApiGet<T = any>(endpoint: string): Promise<T> {
  const response = await secureApiFetch(endpoint);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Helper function for making POST requests
 */
export async function secureApiPost<T = any>(
  endpoint: string,
  data: any
): Promise<T> {
  const response = await secureApiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Helper function for making PUT requests
 */
export async function secureApiPut<T = any>(
  endpoint: string,
  data: any
): Promise<T> {
  const response = await secureApiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Helper function for making DELETE requests
 */
export async function secureApiDelete(endpoint: string): Promise<void> {
  const response = await secureApiFetch(endpoint, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}
