import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Trophy, User as UserIcon, Play, X, Download, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkUserRole } from "@/lib/roleUtils";
import { captureUserLocation } from "@/lib/geolocation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  name: string | null;
  region: string;
}

interface Test {
  id: string;
  created_at: string;
  completed: boolean;
  scores: any;
  paused: boolean;
  time_remaining: number;
  current_dimension: number;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, region")
        .eq("user_id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (!profileData?.region || profileData.region === "Unknown" || profileData.region === "global") {
        captureUserLocation(session.user.id).then((success) => {
          if (success) {
            supabase
              .from("profiles")
              .select("name, region")
              .eq("user_id", session.user.id)
              .single()
              .then(({ data }) => {
                if (data) setProfile(data);
              });
          }
        }).catch((error) => {
          console.error("Failed to capture location:", error);
        });
      }

      const adminStatus = await checkUserRole(session.user.id);
      setIsAdmin(adminStatus);

      const { data: testsData, error: testsError } = await supabase
        .from("tests")
        .select("id, created_at, completed, scores, paused, time_remaining, current_dimension")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (testsError) throw testsError;
      setTests(testsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (version: 'beginner' | 'professional' | 'expert') => {
    navigate(`/test?version=${version}`);
  };

  const handleResumeTest = (testId: string) => {
    navigate(`/test?resume=${testId}`);
  };

  const handleAbandonTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from("tests")
        .delete()
        .eq("id", testId);

      if (error) throw error;

      toast({
        title: "Test Abandoned",
        description: "The paused test has been removed",
      });

      checkAuth();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleExportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [profileRes, testsRes, resultsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", session.user.id).single(),
        supabase.from("tests").select("*").eq("user_id", session.user.id),
        supabase.from("public_results").select("*").eq("user_id", session.user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: session.user.id,
        email: session.user.email,
        profile: profileRes.data,
        tests: testsRes.data,
        shared_results: resultsRes.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aiq-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from("public_results").delete().eq("user_id", session.user.id);
      await supabase.from("tests").delete().eq("user_id", session.user.id);
      await supabase.from("profiles").delete().eq("user_id", session.user.id);

      await supabase.auth.signOut();
      
      toast({
        title: "Account Deleted",
        description: "All your data has been permanently deleted.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} isAdmin={isAdmin} />
        <div className="container py-12">
          <div className="text-center text-muted-foreground">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} isAdmin={isAdmin} />
      
      <main className="container py-8 max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black mb-2 tracking-tight">
            Welcome Back{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Ready to measure your AI collaboration intelligence?
          </p>
        </div>

        {/* Paused Test Alert */}
        {tests.some(t => t.paused) && (
          <Card className="mb-6 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
            <CardContent className="pt-5 pb-5">
              {tests.filter(t => t.paused).map((test) => (
                <div key={test.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500 rounded-full">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">Resume Your Assessment</h3>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Paused on {new Date(test.created_at).toLocaleDateString()} • Section {test.current_dimension + 1}/8
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-black">Abandon Paused Test?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this paused test. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAbandonTest(test.id);
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 bg-amber-100 dark:bg-amber-900/30 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all" 
                        style={{ width: `${((test.current_dimension + 1) / 8) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-100 whitespace-nowrap">
                      {Math.floor(test.time_remaining / 60)}:{(test.time_remaining % 60).toString().padStart(2, '0')} left
                    </span>
                  </div>

                  <Button 
                    onClick={() => handleResumeTest(test.id)} 
                    className="w-full bg-amber-600 hover:bg-amber-700 font-semibold"
                    size="sm"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continue Assessment
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Stats */}
          <Card className="shadow-sm border">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Your Profile</h3>
                  <p className="text-xs text-muted-foreground">{profile?.region || "Global"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tests Taken</span>
                  <span className="font-bold tabular-nums">{tests.filter(t => t.completed).length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-bold tabular-nums">{tests.filter(t => t.paused).length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-bold">{isAdmin ? "Admin" : "User"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start New Test CTA */}
          <Card className="lg:col-span-2 shadow-sm border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="pt-5 pb-5">
              <h2 className="text-xl font-black mb-2">Start New Assessment</h2>
              <p className="text-sm text-muted-foreground mb-4">Choose the level that matches your AI experience</p>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  onClick={() => handleStartTest('beginner')}
                  variant="outline"
                  className="h-auto py-3 px-2 flex-col gap-1 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                  size="sm"
                >
                  <span className="text-xs font-bold">Foundational</span>
                  <span className="text-[10px] text-muted-foreground">24 questions</span>
                  <span className="text-[10px] text-muted-foreground">15 min</span>
                </Button>
                <Button 
                  onClick={() => handleStartTest('professional')}
                  variant="outline"
                  className="h-auto py-3 px-2 flex-col gap-1 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                  size="sm"
                >
                  <span className="text-xs font-bold">Comprehensive</span>
                  <span className="text-[10px] text-muted-foreground">80 questions</span>
                  <span className="text-[10px] text-muted-foreground">60 min</span>
                </Button>
                <Button 
                  onClick={() => handleStartTest('expert')}
                  variant="outline"
                  className="h-auto py-3 px-2 flex-col gap-1 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                  size="sm"
                >
                  <span className="text-xs font-bold">Advanced</span>
                  <span className="text-[10px] text-muted-foreground">80 questions</span>
                  <span className="text-[10px] text-muted-foreground">60 min</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <Card className="mb-6 shadow-sm border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black">Recent Results</CardTitle>
                  <CardDescription className="text-xs">Your latest AIQ assessments</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tests.length === 0 ? (
              <div className="text-center py-8 bg-secondary/20 rounded-lg">
                <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium mb-2">No tests taken yet</p>
                <p className="text-xs text-muted-foreground">Start your first AIQ assessment to see results here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tests.filter(t => !t.paused).slice(0, 5).map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 border rounded-lg transition-colors group"
                  >
                    <div
                      className={`flex-1 ${test.completed ? 'cursor-pointer hover:bg-accent/50 rounded-md -m-1 p-1' : ''}`}
                      onClick={() => test.completed && navigate(`/results/${test.id}`)}
                    >
                      <p className="text-sm font-bold">
                        {test.completed ? "Completed Assessment" : "In Progress"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(test.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      {!test.completed && (
                        <p className="text-xs text-muted-foreground mt-1">Results will be available on completion.</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {test.completed ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs group-hover:bg-accent"
                          onClick={() => navigate(`/results/${test.id}`)}
                        >
                          View
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled className="text-xs">
                          View
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-black">Delete Test?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this test and its results. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAbandonTest(test.id);
                              }}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-black">Data Management</CardTitle>
            <CardDescription className="text-xs">Export or delete your data (GDPR compliance)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Button 
                onClick={handleExportData}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-semibold"
              >
                <Download className="mr-2 h-4 w-4" />
                Export All My Data (JSON)
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start text-xs font-semibold"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-black">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 text-sm">
                      <p>This action cannot be undone. This will permanently delete:</p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Your profile information</li>
                        <li>All test results and history</li>
                        <li>All shared certificates</li>
                        <li>Your account and login credentials</li>
                      </ul>
                      <p className="font-bold text-destructive">We recommend exporting your data first.</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                    >
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="pt-2 px-1">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Your GDPR Rights:</p>
                <ul className="text-[11px] text-muted-foreground space-y-0.5 pl-3">
                  <li>• Right to access your data</li>
                  <li>• Right to data portability</li>
                  <li>• Right to erasure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;