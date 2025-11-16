import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, Wrench, GraduationCap, User, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuthStore } from "../stores/authStore";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/"
            className="hover:opacity-80 transition-opacity"
          >
            <Logo className="h-8 w-auto" variant="dark" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/repairs"
              className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${
                isActive('/repairs') ? 'text-blue-600' : ''
              }`}
            >
              <Wrench className="h-4 w-4" />
              Repairs
            </Link>
            <Link 
              to="/lessons"
              className={`flex items-center gap-2 hover:text-blue-600 transition-colors ${
                isActive('/lessons') ? 'text-blue-600' : ''
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Lessons
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Welcome, {user.name}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link to="/signin" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <Link 
              to="/repairs"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 hover:text-blue-600 transition-colors py-2 ${
                isActive('/repairs') ? 'text-blue-600' : ''
              }`}
            >
              <Wrench className="h-4 w-4" />
              Repairs
            </Link>
            <Link 
              to="/lessons"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 hover:text-blue-600 transition-colors py-2 ${
                isActive('/lessons') ? 'text-blue-600' : ''
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Lessons
            </Link>
            
            {user ? (
              <>
                <div className="text-sm text-slate-600 py-2">Welcome, {user.name}</div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild className="w-full">
                <Link to="/signin" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}