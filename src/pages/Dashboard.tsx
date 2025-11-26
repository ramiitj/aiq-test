import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Trophy, User as UserIcon, Play, X, Download, Trash2, ArrowRight, Clock, Brain, GraduationCap, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkUserRole } from "@/lib/roleUtils";
import { captureUserLocation } from "@/lib/geolocation";
import { Badge } from "@/components/ui/badge";
import { generalTrack, adolescent14_15Track } from "@/lib/trackData";
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
  test_version?: string;
  product_slug?: string;
}

interface CompletedTest {
  id: string;
  test_id: string;
  created_at: string;
  test_completion_date: string;
  overall_score: number;
  test_version: string;
  product_slug?: string;
  product_name?: string;
  test_duration_seconds?: number;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [completedTests, setCompletedTests] = useState<CompletedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Only redirect if we're certain there's no session (not just a network error)
      if (!session) {
        // Check if it's a network error vs actual no-auth
        if (sessionError) {
          console.error("Session check error:", sessionError);
          toast({
            title: "Connection Issue",
            description: "Having trouble verifying your session. Please check your connection.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        // Only redirect if truly not authenticated
        navigate("/sign-in");
        return;
      }

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
        .select("id, created_at, completed, scores, paused, time_remaining, current_dimension, test_version, product_slug")
        .eq("user_id", session.user.id)
        .eq("completed", false)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch completed tests with product info
      const { data: completedData, error: completedError } = await supabase
        .from("public_results")
        .select(`
          id,
          test_id,
          created_at,
          test_completion_date,
          overall_score,
          test_version,
          product_slug,
          test_duration_seconds
        `)
        .eq("user_id", session.user.id)
        .order("test_completion_date", { ascending: false })
        .limit(10);

      if (testsError) throw testsError;
      if (completedError) throw completedError;

      // Fetch product names for completed tests
      if (completedData && completedData.length > 0) {
        const productSlugs = [...new Set(completedData.map(t => t.product_slug).filter(Boolean))];
        if (productSlugs.length > 0) {
          const { data: products } = await supabase
            .from("assessment_products")
            .select("slug, name")
            .in("slug", productSlugs);

          const productMap = new Map(products?.map(p => [p.slug, p.name]) || []);
          
          setCompletedTests(completedData.map(test => ({
            ...test,
            product_name: test.product_slug ? productMap.get(test.product_slug) : undefined
          })));
        } else {
          setCompletedTests(completedData);
        }
      }
      
      // Auto-pause abandoned tests (incomplete, not paused, older than 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const abandonedTests = (testsData || []).filter(
        t => !t.completed && !t.paused && new Date(t.created_at) < new Date(fiveMinutesAgo)
      );
      
      if (abandonedTests.length > 0) {
        const updates = abandonedTests.map(t => 
          supabase
            .from("tests")
            .update({ paused: true })
            .eq("id", t.id)
        );
        await Promise.all(updates);
        
        // Refetch to get updated data
        const { data: updatedData } = await supabase
          .from("tests")
          .select("id, created_at, completed, scores, paused, time_remaining, current_dimension, test_version, product_slug")
          .eq("user_id", session.user.id)
          .eq("completed", false)
          .order("created_at", { ascending: false })
          .limit(5);
        
        setTests(updatedData || []);
      } else {
        setTests(testsData || []);
      }
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


  const handleResumeTest = (testId: string) => {
    navigate(`/ai-assessment?resume=${testId}`);
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

  const handleDeleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from("tests")
        .delete()
        .eq("id", testId);

      if (error) throw error;

      toast({
        title: "Test Deleted",
        description: "The test has been permanently removed",
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

      // Delete all user data in correct order (GDPR compliance)
      await supabase.from("test_demographics").delete().eq("user_id", session.user.id);
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
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navigation isAuthenticated={true} isAdmin={isAdmin} />
      
      <main className="container py-8 max-w-6xl flex-1">
        {/* Welcome Header */}
        <div className="mb-8 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 tracking-tight">
            Welcome Back{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Ready to measure your AIQ<sup className="text-[0.6em]">™</sup>?
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
                  <span className="text-muted-foreground">Total Completed</span>
                  <span className="font-bold tabular-nums">{completedTests.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">General Track</span>
                  <span className="font-bold tabular-nums">
                    {completedTests.filter(t => t.product_slug?.includes('general')).length}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Student Track</span>
                  <span className="font-bold tabular-nums">
                    {completedTests.filter(t => t.product_slug?.includes('adolescent')).length}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Professional Track</span>
                  <span className="font-bold tabular-nums">
                    {completedTests.filter(t => t.product_slug && !t.product_slug.includes('general') && !t.product_slug.includes('adolescent')).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browse All Assessments CTA */}
          <Card className="lg:col-span-2 shadow-lg border-2 border-blue-900 bg-gradient-to-br from-blue-900 to-indigo-900">
            <CardContent className="pt-8 pb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-black mb-2 text-white">Explore All Assessments</h2>
                <p className="text-sm text-white/90">
                  19 specialized assessments across 3 tracks
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* General Track */}
                <Link to="/assessments/general" className="block group">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-blue-400 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <Brain className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-black">General Track</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Universal AI collaboration • 2 levels • 8 dimensions assessed
                    </p>
                    
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 h-9 mt-auto"
                      size="sm"
                    >
                      View General
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Link>

                {/* Student Track */}
                <Link to="/assessments/adolescent" className="block group">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-green-400 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-black">Student Track</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Age-appropriate literacy • Ages 14-17 • 8 dimensions assessed
                    </p>
                    
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 h-9 mt-auto"
                      size="sm"
                    >
                      View Student
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Link>

                {/* Professional Track */}
                <Link to="/assessments/professional" className="block group">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-purple-400 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                        <Briefcase className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-black">Professional Track</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Role-specific • 15 specialized roles • 8 dimensions per role
                    </p>
                    
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 h-9 mt-auto"
                      size="sm"
                    >
                      View Professional
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Assessments - Grouped by Track */}
        {completedTests.length > 0 && (
          <Card className="mb-6 shadow-sm border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black">Completed Assessments</CardTitle>
                  <CardDescription className="text-xs">
                    Your AIQ<sup className="text-[0.6em]">™</sup> assessment history
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {completedTests.map((test) => {
                  const productName = test.product_name || 
                    (test.test_version === 'beginner' ? 'AIQ General Assessment - Beginner' : 
                     'AIQ General Assessment - Advanced');
                  const trackBadge = test.product_slug?.includes('adolescent') ? 'Student' :
                    test.product_slug?.includes('general') ? 'General' : 'Professional';
                  const passed = test.overall_score >= (test.test_version === 'beginner' ? 336 : 448);
                  
                  return (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/results/${test.test_id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold">{productName}</p>
                          <Badge variant="outline" className="text-xs">
                            {trackBadge}
                          </Badge>
                          {passed && (
                            <Badge className="text-xs bg-green-500">
                              Passed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Completed {new Date(test.test_completion_date || test.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })} • Score: {test.overall_score}
                          {test.test_duration_seconds && (
                            <> • {Math.floor(test.test_duration_seconds / 60)} min</>
                          )}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs group-hover:bg-accent"
                      >
                        View Results
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent In-Progress Tests */}
        <Card className="mb-6 shadow-sm border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black">Recent Activity</CardTitle>
                  <CardDescription className="text-xs">In-progress and recent tests</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {tests.filter(t => !t.paused).length === 0 ? (
              <div className="text-center py-8 bg-secondary/20 rounded-lg">
                <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium mb-2">No recent activity</p>
                <p className="text-xs text-muted-foreground">Start a new assessment to see it here</p>
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
                            <AlertDialogTitle className="font-black">Delete Test Record?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {test.completed 
                                ? "This will permanently delete this test and its results. This action cannot be undone."
                                : "This will permanently delete this incomplete test. This action cannot be undone."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTest(test.id);
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

      <Footer />
    </div>
  );
};

export default Dashboard;