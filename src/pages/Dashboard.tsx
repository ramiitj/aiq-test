import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Trophy, User as UserIcon, Play, X, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkUserRole } from "@/lib/roleUtils";
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

      // Check admin role
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

      checkAuth(); // Refresh the list
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
        <div className="container py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} isAdmin={isAdmin} />
      
      <main className="container py-8 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
            Welcome back, {profile?.name || "User"}!
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Ready to take your AIQ test or review your results?
          </p>
        </div>

        {/* Test Version Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Choose Your Assessment Level</h2>
          <p className="text-muted-foreground mb-6">
            Select the version that matches your experience level with AI
          </p>
          
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Beginner Version */}
            <Card className="shadow-elegant hover:shadow-xl transition-shadow border-2 hover:border-primary cursor-pointer" onClick={() => handleStartTest('beginner')}>
              <CardHeader>
                <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-semibold mb-2">
                  Beginner
                </div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  15-Minute Assessment
                </CardTitle>
                <CardDescription className="text-base">
                  24 questions • Foundational level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Perfect for those new to AI or looking to establish baseline knowledge
                </p>
                <Button className="w-full" size="lg">
                  Start Beginner Test
                </Button>
              </CardContent>
            </Card>

            {/* Professional Version */}
            <Card className="shadow-elegant hover:shadow-xl transition-shadow border-2 hover:border-primary cursor-pointer" onClick={() => handleStartTest('professional')}>
              <CardHeader>
                <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-semibold mb-2">
                  Professional
                </div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  60-Minute Assessment
                </CardTitle>
                <CardDescription className="text-base">
                  80 questions • Comprehensive level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For professionals actively using AI in their work
                </p>
                <Button className="w-full" size="lg">
                  Start Professional Test
                </Button>
              </CardContent>
            </Card>

            {/* Expert Version */}
            <Card className="shadow-elegant hover:shadow-xl transition-shadow border-2 hover:border-primary cursor-pointer" onClick={() => handleStartTest('expert')}>
              <CardHeader>
                <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full text-sm font-semibold mb-2">
                  Expert
                </div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  60-Minute Assessment
                </CardTitle>
                <CardDescription className="text-base">
                  80 questions • Advanced level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For AI experts, leaders, and advanced practitioners
                </p>
                <Button className="w-full" size="lg">
                  Start Expert Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl">
              <UserIcon className="h-6 w-6 text-primary" />
              Your Profile
            </CardTitle>
            <CardDescription className="text-base">Account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Region:</span>
              <span className="font-semibold">{profile?.region || "Global"}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-semibold">
                {isAdmin ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Tests Taken:</span>
              <span className="font-semibold tabular-nums">{tests.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Paused Test Card */}
        {tests.some(t => t.paused) && (
          <Card className="shadow-elegant border-amber-500 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl text-amber-600">
                <Play className="h-6 w-6" />
                Resume Paused Test
              </CardTitle>
              <CardDescription className="text-base">
                Continue where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tests.filter(t => t.paused).map((test) => (
                <div key={test.id} className="p-5 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-950">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-base font-semibold">AIQ Assessment in Progress</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Paused on {new Date(test.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAbandonTest(test.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="ml-2 font-semibold">
                        Section {test.current_dimension + 1}/8
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time Left:</span>
                      <span className="ml-2 font-semibold">
                        {Math.floor(test.time_remaining / 60)}:{(test.time_remaining % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleResumeTest(test.id)} 
                    className="w-full"
                    size="lg"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume Test
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl">
              <Trophy className="h-6 w-6 text-primary" />
              Recent Test Results
            </CardTitle>
            <CardDescription className="text-base">
              Your most recent AIQ test attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <p className="text-base text-muted-foreground text-center py-10">
                No tests taken yet. Start your first AIQ assessment above!
              </p>
            ) : (
              <div className="space-y-4">
                {tests.filter(t => !t.paused).map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-5 border rounded-lg hover:bg-accent/50 transition-smooth cursor-pointer"
                    onClick={() => navigate(`/results/${test.id}`)}
                  >
                    <div>
                      <p className="text-base font-semibold">
                        {test.completed ? "Completed Test" : "In Progress"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(test.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-base">
                      View Results
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* GDPR Data Management */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl">Data Management</CardTitle>
            <CardDescription>
              Export or delete your data in compliance with GDPR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="mr-2 h-4 w-4" />
                Export All My Data (JSON)
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action cannot be undone. This will permanently delete:</p>
                      <ul className="list-disc pl-6">
                        <li>Your profile information</li>
                        <li>All test results and history</li>
                        <li>All shared certificates</li>
                        <li>Your account and login credentials</li>
                      </ul>
                      <p className="font-semibold mt-4">We recommend exporting your data first.</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="text-xs text-muted-foreground pt-2">
                <p>Your rights under GDPR:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Right to access your data</li>
                  <li>Right to data portability</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                </ul>
                <a href="/privacy" className="text-primary underline hover:no-underline mt-2 inline-block">
                  View Privacy Policy
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
