import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

type Props = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const { user, openAuthModal } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      openAuthModal(location.pathname);
    }
  }, [user, openAuthModal, location.pathname]);

  // Always render children; dialog overlay will block interaction for guests
  return <>{children}</>;
}


