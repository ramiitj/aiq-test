import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Trophy, User as UserIcon, Play, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  name: string | null;
  is_admin: boolean;
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
        .select("name, is_admin, region")
        .eq("user_id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

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

  const handleStartTest = () => {
    navigate("/test");
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} isAdmin={profile?.is_admin} />
        <div className="container py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} isAdmin={profile?.is_admin} />
      
      <main className="container py-8 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
            Welcome back, {profile?.name || "User"}!
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Ready to take your AIQ test or review your results?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl">
                <PlayCircle className="h-6 w-6 text-primary" />
                Start New Test
              </CardTitle>
              <CardDescription className="text-base">
                Take the adaptive AIQ assessment (approximately 60 minutes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStartTest} className="w-full text-base" size="lg">
                Begin AIQ Test
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
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
                  {profile?.is_admin ? "Admin" : "User"}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Tests Taken:</span>
                <span className="font-semibold tabular-nums">{tests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

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
      </main>
    </div>
  );
};

export default Dashboard;
