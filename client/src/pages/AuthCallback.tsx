import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback, error, intendedPath, closeAuthModal } = useAuthStore();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple calls
    if (hasProcessed.current) {
      return;
    }

    const token = searchParams.get('token');

    if (!token) {
      console.warn('[AuthCallback] No token found in URL, redirecting to sign in');
      navigate('/signin', { replace: true });
      return;
    }

    // URL decode the token in case it was encoded
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
    } catch (e) {
      console.warn('[AuthCallback] Token decode failed, using original:', e);
    }

    console.log('[AuthCallback] Processing token from URL');
    hasProcessed.current = true;

    handleGoogleCallback(decodedToken)
      .then(() => {
        console.log('[AuthCallback] Authentication successful, redirecting');
        const from = searchParams.get('from') || intendedPath || '/';
        closeAuthModal();
        navigate(from, { replace: true });
      })
      .catch((err) => {
        // Error is handled by the store, just stay on this page to show it
        console.error('[AuthCallback] Error handling Google callback:', err);
        hasProcessed.current = false; // Allow retry on error
      });
  }, [searchParams, navigate, intendedPath, closeAuthModal, handleGoogleCallback]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Authentication Error</strong>
              <p className="mt-2">{error}</p>
              <p className="mt-4 text-sm text-slate-600">
                Please try signing in again. If the problem persists, contact support.
              </p>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                hasProcessed.current = false;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
}
