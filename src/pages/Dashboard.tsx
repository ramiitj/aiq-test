import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp, User as UserIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
        .select("id, created_at, completed, scores")
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} isAdmin={profile?.is_admin} />
      
      <main className="container py-12 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3">
            {getGreeting()}, <span className="gradient-text">{profile?.name || "User"}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to take your AIQ test or review your results?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card className="shadow-premium hover-lift border-2 card-gradient-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                Start New Test
              </CardTitle>
              <CardDescription className="text-base">
                Take the adaptive AIQ assessment • ~60 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Estimated time: 60 minutes</span>
              </div>
              <Button onClick={handleStartTest} variant="gradient" className="w-full" size="lg">
                Begin AIQ Test
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-premium hover-lift border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <UserIcon className="h-6 w-6 text-secondary" />
                </div>
                Your Profile
              </CardTitle>
              <CardDescription className="text-base">Account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-accent/30">
                <span className="text-muted-foreground font-medium">Region:</span>
                <span className="font-semibold">{profile?.region || "Global"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-accent/30">
                <span className="text-muted-foreground font-medium">Role:</span>
                <span className="font-semibold">
                  {profile?.is_admin ? "👑 Admin" : "👤 User"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-accent/30">
                <span className="text-muted-foreground font-medium">Tests Taken:</span>
                <span className="font-semibold text-primary">{tests.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              Recent Test Results
            </CardTitle>
            <CardDescription className="text-base">
              Your most recent AIQ test attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-accent/50 mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No tests taken yet. Start your first AIQ assessment above!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => {
                  // Safely parse and calculate overall score
                  let overallScore = 0;
                  if (test.scores && test.completed) {
                    try {
                      const parsedScores = typeof test.scores === 'string' ? JSON.parse(test.scores) : test.scores;
                      if (Array.isArray(parsedScores) && parsedScores.length > 0) {
                        overallScore = parsedScores.reduce((a: number, b: number) => a + b, 0) / parsedScores.length;
                      }
                    } catch (e) {
                      console.error('Error parsing scores:', e);
                    }
                  }
                  
                  return (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-5 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer hover-lift"
                      onClick={() => navigate(`/results/${test.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                          test.completed && overallScore >= 80 ? "bg-success/10 text-success" :
                          test.completed && overallScore >= 60 ? "bg-primary/10 text-primary" :
                          test.completed ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                        )}>
                          {test.completed ? Math.round(overallScore) : "—"}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {test.completed ? "✓ Completed Test" : "⏸ In Progress"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(test.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details →
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
