import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback, error, intendedPath, closeAuthModal } = useAuthStore();
  const hasProcessed = useRef(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [debugInfo, setDebugInfo] = React.useState<Record<string, unknown> | null>(null);

  // Store token in sessionStorage as backup in case page reloads
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      sessionStorage.setItem('google_auth_token_backup', tokenParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Prevent multiple calls
    if (hasProcessed.current) {
      return;
    }

    // Try multiple methods to get the token
    // Priority: query parameter (primary) > hash fragment (fallback)
    let token: string | null = null;

    // First try: query parameter (primary method)
    if (searchParams.get('token')) {
      token = searchParams.get('token');
    }

    // Second try: direct URLSearchParams parsing from search (fallback)
    if (!token && window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
    }

    // Third try: hash fragment (fallback, in case query was stripped)
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get('token');
    }
    
    // Fourth try: localStorage (token may have been captured by pre-React script)
    if (!token) {
      const storedToken = localStorage.getItem('gringo_surf_token');
      if (storedToken) {
        token = storedToken;
      }
    }
    
    // Fifth try: sessionStorage backup (in case page reloaded and query params were lost)
    if (!token) {
      const backupToken = sessionStorage.getItem('google_auth_token_backup');
      if (backupToken) {
        token = backupToken;
        // Store in localStorage for consistency
        localStorage.setItem('gringo_surf_token', backupToken);
        // Clear the backup after using it
        sessionStorage.removeItem('google_auth_token_backup');
      }
    }

    if (!token) {
      const urlBreakdown = {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        allParams: Object.fromEntries(searchParams.entries()),
      };
      
      console.error('[AuthCallback] No token found');
      setDebugInfo(urlBreakdown);
      setLocalError('No authentication token found. The redirect may have stripped query parameters.');
      
      // Show error to user for 5 seconds before redirecting
      setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 5000);
      return;
    }

    // URL decode the token in case it was encoded
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
    } catch {
      // Use original token if decode fails
    }
    
    // Ensure token is stored in localStorage (in case pre-React script didn't run)
    localStorage.setItem('gringo_surf_token', decodedToken);
    sessionStorage.setItem('google_auth_token_backup', decodedToken);
    
    hasProcessed.current = true;

    handleGoogleCallback(decodedToken)
      .then(() => {
        // Wait for auth state to be fully initialized before navigating
        const checkAuthState = () => {
          const state = useAuthStore.getState();
          
          // Ensure state is initialized and not loading before navigating
          if (state.isInitialized && !state.isLoading) {
            const from = searchParams.get('from') || intendedPath || '/';
            closeAuthModal();
            // Use replace to avoid adding to history
            navigate(from, { replace: true });
          } else {
            // Wait a bit more if state isn't ready
            setTimeout(checkAuthState, 50);
          }
        };
        
        // Start checking after a small delay
        setTimeout(checkAuthState, 100);
      })
      .catch((err) => {
        // Error is handled by the store, just stay on this page to show it
        console.error('[AuthCallback] Error handling Google callback:', err);
        console.error('[AuthCallback] Error stack:', err instanceof Error ? err.stack : 'No stack');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setLocalError(`Failed to complete authentication: ${errorMessage}`);
        setDebugInfo({
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
          url: window.location.href,
        });
        hasProcessed.current = false; // Allow retry on error
      });
  }, [searchParams, navigate, intendedPath, closeAuthModal, handleGoogleCallback]);

  const displayError = error || localError;
  
  if (displayError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Authentication Error</strong>
              <p className="mt-2">{displayError}</p>
              <p className="mt-4 text-sm text-slate-600">
                Please try signing in again. If the problem persists, contact support.
              </p>
              {debugInfo && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer text-slate-500">Debug Info</summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                hasProcessed.current = false;
                setLocalError(null);
                navigate('/signin', { replace: true });
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Return to sign in
            </button>
            <span className="text-slate-400">|</span>
            <button
              onClick={() => {
                hasProcessed.current = false;
                setLocalError(null);
                window.location.reload();
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show debug info in development
  const isDev = import.meta.env.DEV;
  const token = searchParams.get('token') || new URLSearchParams(window.location.search).get('token');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Completing sign in...</p>
        {isDev && (
          <div className="mt-4 p-4 bg-slate-100 rounded text-left text-xs text-slate-600">
            <p><strong>Debug Info:</strong></p>
            <p>Path: {window.location.pathname}</p>
            <p>Search: {window.location.search}</p>
            <p>Token present: {token ? 'Yes' : 'No'}</p>
            <p>Token length: {token?.length || 0}</p>
            <p>Processed: {hasProcessed.current ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
