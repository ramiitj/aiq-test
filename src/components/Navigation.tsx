import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, BookOpen, Settings, GraduationCap, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                AIQ<sup className="text-[0.6em] text-blue-600">™</sup>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="font-semibold text-sm">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Assessments
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/assessments/general" className="cursor-pointer">
                    General
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/assessments/student" className="cursor-pointer">
                    Students
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/assessments/professional" className="cursor-pointer">
                    Professionals
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                <Button onClick={handleLogout} variant="ghost" size="sm" className="font-semibold text-sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/sign-in">
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
              <Link to="/sign-in">
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
