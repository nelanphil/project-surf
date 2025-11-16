import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback, isLoading, error } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      handleGoogleCallback(token)
        .then(() => {
          // Redirect to home page on success
          navigate('/', { replace: true });
        })
        .catch((err) => {
          // Error is handled by the store, just stay on this page to show it
          console.error('Error handling Google callback:', err);
        });
    } else {
      // No token in URL, redirect to sign in
      navigate('/signin', { replace: true });
    }
  }, [searchParams, handleGoogleCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <br />
              <button
                onClick={() => navigate('/signin')}
                className="mt-4 text-sm underline"
              >
                Return to sign in
              </button>
            </AlertDescription>
          </Alert>
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

