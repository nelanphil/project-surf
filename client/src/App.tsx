import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { RepairsPage } from "./pages/RepairsPage";
import { LessonsPage } from "./pages/LessonsPage";
import { BookingPage } from "./pages/BookingPage";
import { AccountPage } from "./pages/AccountPage";
import { AdminPage } from "./pages/AdminPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import ContactPage from "./pages/ContactPage";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import AuthGateModal from "./components/AuthGateModal";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <ScrollToTop />
        <Navigation />
        <main className="pt-20 md:pt-24">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/repairs"
              element={
                <RequireAuth>
                  <RepairsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/lessons"
              element={
                <RequireAuth>
                  <LessonsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/lessons/booking"
              element={
                <RequireAuth>
                  <BookingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminPage />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <AuthGateModal />
        <Toaster />
      </div>
    </Router>
  );
}
