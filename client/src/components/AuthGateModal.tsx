import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useAuthStore } from "../stores/authStore";

export default function AuthGateModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    authModalOpen,
    closeAuthModal,
    intendedPath,
  } = useAuthStore();

  const fromPath = intendedPath || location.pathname;
  const backendBase =
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5050";

  const goTo = (path: string) => {
    // preserve intended path via query string
    closeAuthModal();
    navigate(`${path}?from=${encodeURIComponent(fromPath)}`);
  };

  const startGoogle = () => {
    // send user to backend OAuth start; include intended path
    const url = `${backendBase}/api/users/auth/google?from=${encodeURIComponent(
      fromPath
    )}`;
    window.location.href = url;
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            You need an account to access this feature. Choose an option below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Button className="w-full" onClick={() => goTo("/signin")}>
            Sign in
          </Button>
          <Button variant="outline" className="w-full" onClick={() => goTo("/signup")}>
            Sign up
          </Button>
          <Button variant="secondary" className="w-full" onClick={startGoogle}>
            Continue with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


