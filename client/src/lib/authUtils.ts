// Client-side JWT authentication utilities

export interface AuthResponse {
  message: string;
  code?: string;
}

/**
 * Check if an error indicates an authentication issue
 */
export function isAuthError(error: any): boolean {
  if (error instanceof Error) {
    return /^401: .*/.test(error.message) || error.message.includes('Unauthorized');
  }
  return false;
}

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Track if a refresh is already in progress to prevent concurrent refreshes
let isRefreshing = false;

/**
 * Refresh the access token using the refresh token
 */
export async function refreshAuthToken(): Promise<boolean> {
  // Prevent concurrent refresh attempts
  if (isRefreshing) {
    return false;
  }

  isRefreshing = true;

  try {
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      credentials: 'include', // Include cookies
    });

    if (response.ok) {
      return true;
    } else {
      const data: AuthResponse = await response.json();
      console.error('Token refresh failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Check if the current user is authenticated by trying to access a protected endpoint
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      return true;
    } else if (response.status === 401) {
      const data: AuthResponse = await response.json();

      // If token expired, try to refresh
      if (data.code === 'TOKEN_EXPIRED') {
        return await refreshAuthToken();
      }
    }

    return false;
  } catch (error) {
    console.error('Auth status check error:', error);
    return false;
  }
}

/**
 * Logout the user
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/logout', {
      method: 'GET',
      credentials: 'include',
    });

    // Redirect to home or login page
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even if logout fails
    window.location.href = '/';
  }
}

/**
 * Higher-order function to add automatic token refresh to API calls
 */
export function withAuth(fetchFn: typeof fetch) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Check if this request already attempted a refresh to prevent infinite loops
    const hasRetried = init?.headers && 
      (init.headers as Record<string, string>)['X-Auth-Retry'] === 'true';

    const response = await fetchFn(input, {
      ...init,
      credentials: 'include', // Always include cookies
    });

    // If we get a 401, try to refresh and retry once (only if we haven't already tried)
    if (response.status === 401 && !hasRetried) {
      // Don't try to refresh on the refresh token endpoint itself to avoid infinite loops
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/refresh-token')) {
        return response;
      }

      try {
        // Clone the response so we can read it without consuming the original
        const responseClone = response.clone();
        let shouldRefresh = false;
        
        try {
          const data: AuthResponse = await responseClone.json();
          // Refresh if token is explicitly expired, invalid, or if it's a generic unauthorized (no access token)
          shouldRefresh = data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_TOKEN' || !data.code;
        } catch (jsonError) {
          // If we can't parse the response, assume it's a token issue and try to refresh
          shouldRefresh = true;
        }

        if (shouldRefresh) {
          const refreshSuccess = await refreshAuthToken();
          if (refreshSuccess) {
            // Retry the original request with a flag to prevent further retries
            return await fetchFn(input, {
              ...init,
              credentials: 'include',
              headers: {
                ...((init?.headers as Record<string, string>) || {}),
                'X-Auth-Retry': 'true',
              },
            });
          }
        }
      } catch (error) {
        console.error('Error parsing 401 response:', error);
      }
    }

    return response;
  };
}

// Create an enhanced fetch function with auto-refresh
export const authFetch = withAuth(fetch);