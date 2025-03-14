
import { getAuthToken, refreshAuthToken, isTokenExpired } from './auth';

// Base API URL from environment with a default fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Secure fetch wrapper that handles authentication with caching
 */
export async function secureApiFetch(
  endpoint: string,
  options: RequestInit = {},
  useCache: boolean = false
): Promise<Response> {
  // Generate cache key based on endpoint and request options
  const cacheKey = useCache ? 
    `${endpoint}-${options.method || 'GET'}-${JSON.stringify(options.body || '')}` : 
    null;
  
  // Check cache for GET requests if useCache is true
  if (useCache && options.method === undefined && cacheKey) {
    const cachedResponse = apiCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_DURATION) {
      // Return cached response as a Response object
      return new Response(JSON.stringify(cachedResponse.data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }
  }
  
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
  
  try {
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
    
    // Cache successful GET responses if useCache is true
    if (useCache && response.ok && options.method === undefined && cacheKey) {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      apiCache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return response;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

/**
 * Helper function for making GET requests with optional caching
 */
export async function secureApiGet<T = any>(endpoint: string, useCache: boolean = false): Promise<T> {
  const response = await secureApiFetch(endpoint, {}, useCache);
  
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

// Function to clear the API cache
export function clearApiCache(): void {
  apiCache.clear();
}
