import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const { user, isLoading, isInitialized, openAuthModal } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Only check auth and show modal if:
    // 1. Auth state has been initialized (initial fetch completed)
    // 2. Not currently loading auth state
    // 3. User is not authenticated
    if (isInitialized && !isLoading && !user) {
      console.log('[RequireAuth] User not authenticated, opening auth modal');
      openAuthModal(location.pathname);
    } else if (!isInitialized || isLoading) {
      console.log('[RequireAuth] Waiting for auth initialization', { isInitialized, isLoading });
    }
  }, [user, isLoading, isInitialized, openAuthModal, location.pathname]);

  // Always render children; dialog overlay will block interaction for guests
  return <>{children}</>;
}


