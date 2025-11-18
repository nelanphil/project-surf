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

// Log API configuration on module load (only once)
if (typeof window !== 'undefined') {
  console.log('[Auth Store] API Base URL:', API_BASE_URL);
  console.log('[Auth Store] Environment:', import.meta.env.MODE);
}

// Initialize from localStorage
const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  error: null,
  authModalOpen: false,
  intendedPath: null,
  isAuthenticated: !!getStoredUser(),
  isInitialized: false,

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
    
    console.log('[Google Auth] Initiating Google sign-in');
    console.log('[Google Auth] API URL:', apiUrl);
    console.log('[Google Auth] Backend URL:', backendUrl);
    console.log('[Google Auth] Google Auth URL:', googleAuthUrl);
    
    window.location.href = googleAuthUrl;
  },

  fetchCurrentUser: async () => {
    const { token } = get();
    
    if (!token) {
      console.log('[Auth Store] No token found, marking as initialized');
      set({ user: null, isLoading: false, isInitialized: true });
      return;
    }

    console.log('[Auth Store] Fetching current user, setting isLoading=true');
    set({ isLoading: true });
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[Auth Store] fetchCurrentUser response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          id: userData._id || userData.id,
          email: userData.email,
          name: userData.name,
          isAdmin: userData.isAdmin || false,
        };
        
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log('[Auth Store] User fetched successfully:', { id: user.id, email: user.email });
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
        console.warn('[Auth Store] Token validation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.message || errorData.error || 'Unknown error',
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
    console.log('[Google Auth] Starting callback handling');
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
      
      console.log('[Google Auth] Token validated, storing in localStorage');
      
      // Store token immediately (but don't set isAuthenticated until we have user data)
      localStorage.setItem(TOKEN_KEY, token);
      set({ token });
      
      console.log('[Google Auth] Fetching user data from /users/me');
      
      // Fetch user data
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[Google Auth] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to fetch user data (${response.status})`;
        console.error('[Google Auth] Failed to fetch user:', errorMessage, response.status);
        throw new Error(errorMessage);
      }

      const userData = await response.json();
      console.log('[Google Auth] User data received:', { id: userData._id || userData.id, email: userData.email });
      
      const user: User = {
        id: userData._id || userData.id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.isAdmin || false,
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      console.log('[Google Auth] Authentication successful, updating state');
      set({
        user,
        token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        isInitialized: true,
      });
      
      console.log('[Google Auth] Callback handling complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete Google sign-in';
      console.error('[Google Auth] Error handling callback:', error);
      console.error('[Google Auth] Error details:', {
        message: errorMessage,
        token: token ? `${token.substring(0, 20)}...` : 'missing',
        apiUrl: API_BASE_URL,
      });
      
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
  const token = getStoredToken();
  if (token) {
    console.log('[Auth Store] Token found on mount, initializing auth state');
    useAuthStore.getState().fetchCurrentUser();
  } else {
    console.log('[Auth Store] No token found on mount, marking as initialized');
    useAuthStore.setState({ isInitialized: true });
  }
} else {
  // Server-side rendering - mark as initialized immediately
  useAuthStore.setState({ isInitialized: true });
}

