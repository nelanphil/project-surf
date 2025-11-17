import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function RequireAdmin({ children }: Props) {
  const { user, isAuthenticated } = useAuthStore();

  // If not authenticated, redirect to home (RequireAuth will handle auth modal)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // If authenticated but not admin, show error message
  if (!user.isAdmin) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Access Denied
              </CardTitle>
              <CardDescription>You do not have permission to access this page.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                This page is only accessible to administrators. If you believe this is an error,
                please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin
  return <>{children}</>;
}

