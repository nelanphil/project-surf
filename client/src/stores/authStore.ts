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
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      set({
        isLoading: false,
        error: errorMessage,
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
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  signInWithGoogle: () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5050';
    window.location.href = `${backendUrl}/api/users/auth/google`;
  },

  fetchCurrentUser: async () => {
    const { token } = get();
    
    if (!token) {
      set({ user: null, isLoading: false });
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
        });
      } else {
        // Token invalid, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  handleGoogleCallback: async (token: string) => {
    set({ isLoading: true, error: null });
    
    try {
      localStorage.setItem(TOKEN_KEY, token);
      
      // Fetch user data
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
          token,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete Google sign-in';
      console.error('Error handling Google callback:', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
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
    });
  },
}));

// Auto-fetch current user on mount if token exists
if (typeof window !== 'undefined') {
  const token = getStoredToken();
  if (token) {
    useAuthStore.getState().fetchCurrentUser();
  }
}

