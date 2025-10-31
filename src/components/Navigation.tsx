import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, BookOpen, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export const Navigation = ({ isAuthenticated, isAdmin }: NavigationProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">A</span>
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                AIQ<sup className="text-xs">™</sup>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/about">
              <Button variant="ghost" size="sm" className="font-semibold text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                About
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="font-semibold text-sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="font-semibold text-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm"
                  className="font-semibold text-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-blue-900 hover:bg-blue-800 font-semibold">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4" />
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-blue-900 hover:bg-blue-800 font-semibold">
                  Start
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};