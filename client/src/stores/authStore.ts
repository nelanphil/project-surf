import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  // UI/auth gating
  authModalOpen: boolean;
  intendedPath: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  openAuthModal: (path?: string) => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => void;
  fetchCurrentUser: () => Promise<void>;
  handleGoogleCallback: (token: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const TOKEN_KEY = 'gringo_surf_token';
const USER_KEY = 'gringo_surf_user';

// API configuration is set at build time

// Initialize from localStorage
const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Check if we have stored auth data to determine initial state
// Note: Token may have been captured by pre-React script in index.html
const initialToken = getStoredToken();
const initialUser = getStoredUser();
// If we have both token and user, we can mark as initialized optimistically
// If we only have token (no user), we need to wait for fetchCurrentUser
// If we have neither, we're immediately initialized
const canInitializeOptimistically = !!(initialToken && initialUser) || !initialToken;

// If we have a token but no user, and we're on the callback route, 
// the token was just captured - we need to fetch the user
const isOnCallbackRoute = typeof window !== 'undefined' && window.location.pathname === '/auth/callback';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  isLoading: false,
  error: null,
  authModalOpen: false,
  intendedPath: null,
  isAuthenticated: !!initialUser,
  // Mark as initialized if we have complete auth data or no auth data
  // Only wait if we have token but no user (incomplete state)
  isInitialized: canInitializeOptimistically,

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  openAuthModal: (path?: string) => {
    const fallback = typeof window !== 'undefined' ? window.location.pathname : '/';
    set({
      authModalOpen: true,
      intendedPath: path || get().intendedPath || fallback,
    });
  },

  closeAuthModal: () => {
    set({ authModalOpen: false });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to sign in');
      }

      const user: User = {
        id: data.user._id || data.user.id,
        email: data.user.email,
        name: data.user.name,
        isAdmin: data.user.isAdmin || false,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      set({
        user,
        token: data.token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      set({
        isLoading: false,
        error: errorMessage,
        isInitialized: true,
      });
      throw error;
    }
  },

  signUp: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create account');
      }

      const user: User = {
        id: data.user._id || data.user.id,
        email: data.user.email,
        name: data.user.name,
        isAdmin: data.user.isAdmin || false,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      set({
        user,
        token: data.token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      set({
        isLoading: false,
        error: errorMessage,
        isInitialized: true,
      });
      throw error;
    }
  },

  signInWithGoogle: () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
    const backendUrl = apiUrl.replace('/api', '') || 'http://localhost:5050';
    const googleAuthUrl = `${backendUrl}/api/users/auth/google`;
    
    window.location.href = googleAuthUrl;
  },

  fetchCurrentUser: async () => {
    const { token } = get();
    
    if (!token) {
      set({ user: null, isLoading: false, isInitialized: true });
      return;
    }

    set({ isLoading: true });
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          id: userData._id || userData.id,
          email: userData.email,
          name: userData.name,
          isAdmin: userData.isAdmin || false,
        };
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        set({
          user,
          isLoading: false,
          error: null,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        // Token invalid, clear storage
        const errorData = await response.json().catch(() => ({}));
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Auth Store] Error fetching current user:', {
        message: errorMessage,
        apiUrl: API_BASE_URL,
        error: error instanceof Error ? error.stack : error,
      });
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },

  handleGoogleCallback: async (token: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate token format (basic JWT check - should have 3 parts separated by dots)
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        throw new Error('Invalid token: token is missing or empty');
      }
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format: expected JWT token');
      }
      
      // Store token immediately (but don't set isAuthenticated until we have user data)
      localStorage.setItem(TOKEN_KEY, token);
      set({ token });
      
      // Fetch user data
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch user data (${response.status})`;
        throw new Error(errorMessage);
      }

      const userData = await response.json();
      
      const user: User = {
        id: userData._id || userData.id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin || false,
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      set({
        user,
        token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete Google sign-in';
      console.error('[Google Auth] Error handling callback:', errorMessage);
      
      // Clear storage on error
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        user: null,
        token: null,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        isInitialized: true,
      });
      throw error;
    }
  },

  signOut: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      user: null,
      token: null,
      error: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },
}));

// Auto-fetch current user on mount if token exists
if (typeof window !== 'undefined') {
  let token = getStoredToken();
  const user = getStoredUser();
  
  // Always check URL for token if not in localStorage
  // This handles cases where pre-React script didn't run or token was lost during redirect
  if (!token) {
    try {
      // Check URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      // Check hash fragment
      let hashToken = null;
      if (window.location.hash) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          hashToken = hashParams.get('token');
        } catch (e) {
          // Ignore hash parsing errors
        }
      }
      
      // Check sessionStorage backup
      const backupToken = sessionStorage.getItem('google_auth_token_backup');
      
      // Use first available token source
      token = urlToken || hashToken || backupToken;
      
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        if (!backupToken) {
          sessionStorage.setItem('google_auth_token_backup', token);
        }
        // Update store with token
        useAuthStore.setState({ token });
      }
    } catch (error) {
      console.error('[Auth Store] Error checking for token:', error);
    }
  }
  
  if (token && user) {
    // We have both token and user in storage - validate token in background
    // Store is already marked as initialized, so components can proceed optimistically
    useAuthStore.getState().fetchCurrentUser().catch((error) => {
      console.error('[Auth Store] Token validation failed on mount:', error);
      // fetchCurrentUser already handles clearing invalid tokens and updating state
    });
  } else if (token && !user) {
    // We have token but no user - need to fetch user before marking initialized
    // This often happens when token was just captured by pre-React script or from URL
    // Store is NOT initialized yet, so components will wait
    useAuthStore.getState().fetchCurrentUser();
  }
}

