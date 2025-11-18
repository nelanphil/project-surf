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
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  // Log component mount and URL info immediately
  useEffect(() => {
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;
    const queryString = window.location.search;
    
    console.log('[AuthCallback] Component mounted');
    console.log('[AuthCallback] Current URL:', currentUrl);
    console.log('[AuthCallback] Current URL length:', currentUrl.length);
    console.log('[AuthCallback] Current path:', currentPath);
    console.log('[AuthCallback] Query string:', queryString);
    console.log('[AuthCallback] Query string length:', queryString.length);
    console.log('[AuthCallback] All search params:', Object.fromEntries(searchParams.entries()));
    
    // Check if URL might be truncated (some browsers/servers have ~2000 char limit)
    if (currentUrl.length > 2000) {
      console.warn('[AuthCallback] URL is very long, might be truncated:', currentUrl.length);
    }
  }, [searchParams]);

  useEffect(() => {
    // Prevent multiple calls
    if (hasProcessed.current) {
      console.log('[AuthCallback] Already processed, skipping');
      return;
    }

    // Try multiple methods to get the token
    // Priority: query parameter (primary) > hash fragment (fallback)
    let token: string | null = null;
    const currentUrl = window.location.href;

    console.log('[AuthCallback] useEffect triggered');
    console.log('[AuthCallback] Full URL:', currentUrl);
    console.log('[AuthCallback] URL length:', currentUrl.length);
    console.log('[AuthCallback] Hash:', window.location.hash);
    console.log('[AuthCallback] Search:', window.location.search);
    console.log('[AuthCallback] Search length:', window.location.search.length);

    // First try: query parameter (primary method)
    if (searchParams.get('token')) {
      token = searchParams.get('token');
      console.log('[AuthCallback] Token from searchParams:', token ? `${token.substring(0, 20)}...` : 'null');
    }

    // Second try: direct URLSearchParams parsing from search (fallback)
    if (!token && window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
      console.log('[AuthCallback] Token from URLSearchParams:', token ? `${token.substring(0, 20)}...` : 'null');
    }

    // Third try: hash fragment (fallback, in case query was stripped)
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get('token');
      console.log('[AuthCallback] Token from hash:', token ? `${token.substring(0, 20)}...` : 'null');
    }

    if (!token) {
      const urlBreakdown = {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        allParams: Object.fromEntries(searchParams.entries()),
      };
      
      console.error('[AuthCallback] No token found in URL');
      console.error('[AuthCallback] URL breakdown:', urlBreakdown);
      setDebugInfo(urlBreakdown);
      setLocalError('No authentication token found in URL. The redirect may have stripped query parameters.');
      
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
      if (decodedToken !== token) {
        console.log('[AuthCallback] Token was URL encoded, decoded successfully');
      }
    } catch (e) {
      console.warn('[AuthCallback] Token decode failed, using original:', e);
    }

    console.log('[AuthCallback] Processing token from URL');
    console.log('[AuthCallback] Token length:', decodedToken.length);
    console.log('[AuthCallback] Token starts with:', decodedToken.substring(0, 20));
    hasProcessed.current = true;

    handleGoogleCallback(decodedToken)
      .then(() => {
        console.log('[AuthCallback] Authentication successful, redirecting');
        const from = searchParams.get('from') || intendedPath || '/';
        console.log('[AuthCallback] Redirecting to:', from);
        closeAuthModal();
        navigate(from, { replace: true });
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
