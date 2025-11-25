import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, BookOpen, Settings, GraduationCap, ChevronDown, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface NavigationProps {
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export const Navigation = ({ isAuthenticated, isAdmin }: NavigationProps) => {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSheetOpen(false);
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

            <Link to="/features">
              <Button variant="ghost" size="sm" className="font-semibold text-sm">
                Features
              </Button>
            </Link>

            <Link to="/research">
              <Button variant="ghost" size="sm" className="font-semibold text-sm">
                Research
              </Button>
            </Link>

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
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-muted-foreground px-2">Assessments</p>
                    <Link to="/assessments/general" onClick={() => setSheetOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start font-medium">
                        General
                      </Button>
                    </Link>
                    <Link to="/assessments/student" onClick={() => setSheetOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start font-medium">
                        Students
                      </Button>
                    </Link>
                    <Link to="/assessments/professional" onClick={() => setSheetOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start font-medium">
                        Professionals
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t pt-4 flex flex-col gap-2">
                    <Link to="/features" onClick={() => setSheetOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start font-medium">
                        Features
                      </Button>
                    </Link>
                    <Link to="/research" onClick={() => setSheetOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start font-medium">
                        Research
                      </Button>
                    </Link>
                    <Link to="/about" onClick={() => setSheetOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start font-medium">
                        <BookOpen className="h-4 w-4 mr-2" />
                        About
                      </Button>
                    </Link>
                  </div>

                  {isAuthenticated && (
                    <div className="border-t pt-4 flex flex-col gap-2">
                      <Link to="/dashboard" onClick={() => setSheetOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start font-medium">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setSheetOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start font-medium">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin
                          </Button>
                        </Link>
                      )}
                      <Button onClick={handleLogout} variant="ghost" className="w-full justify-start font-medium">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="border-t pt-4">
                      <Link to="/sign-in" onClick={() => setSheetOpen(false)}>
                        <Button size="sm" className="w-full bg-blue-900 hover:bg-blue-800 font-semibold">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
