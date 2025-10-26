import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Download, TrendingUp, Sparkles, Target, Zap, Shield, Layers, Brain, Award } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TestResult {
  id: string;
  scores: number[];
  created_at: string;
  completed: boolean;
}

const dimensionNames = [
  "Strategic AI Understanding",
  "Prompt Engineering Intelligence",
  "Critical Evaluation Capability",
  "Integration Intelligence",
  "Adaptive Learning Capability",
  "Ethical Judgment",
  "Context Sensitivity",
  "Creative Synthesis"
];

const dimensionIcons = [Brain, Sparkles, Target, Layers, TrendingUp, Shield, Zap, Award];

const Results = () => {
  const { testId } = useParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      
      if (!data.completed) {
        toast({
          title: "Test Not Completed",
          description: "This test hasn't been completed yet.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setResult({
        id: data.id,
        scores: typeof data.scores === 'string' ? JSON.parse(data.scores) : data.scores,
        created_at: data.created_at,
        completed: data.completed,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    try {
      const overallScore = result.scores.reduce((a, b) => a + b, 0) / result.scores.length;
      const shareCode = Math.random().toString(36).substring(2, 10);

      const { error } = await supabase.from("public_results").insert({
        test_id: result.id,
        user_id: (await supabase.auth.getUser()).data.user!.id,
        share_code: shareCode,
        overall_score: overallScore,
        dimension_scores: JSON.stringify(result.scores),
      });

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/${shareCode}`;
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Link Copied!",
        description: "Shareable link copied to clipboard.",
      });
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
        <Navigation isAuthenticated={true} />
        <div className="container py-8">
          <div className="text-center">Loading results...</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const overallScore = result.scores.reduce((a, b) => a + b, 0) / result.scores.length;

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} />
      
      <main className="container py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-glow mb-6 shadow-glow">
            <TrendingUp className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Your AIQ Results</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Test completed on {new Date(result.created_at).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-12 shadow-premium hover-lift border-2 animate-scale-in">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center">
              <CircularProgress 
                value={overallScore} 
                size={200} 
                strokeWidth={12}
                className="mb-8"
                valueClassName="flex-col"
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Overall AIQ Score</h2>
                <p className="text-4xl font-bold gradient-text mb-4">
                  <AnimatedNumber value={overallScore} decimals={1} />
                </p>
                <div className={cn(
                  "inline-block px-6 py-2 rounded-full text-lg font-semibold",
                  overallScore >= 80 ? "bg-success/10 text-success" :
                  overallScore >= 60 ? "bg-primary/10 text-primary" :
                  overallScore >= 40 ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                )}>
                  {overallScore >= 80 ? "🎉 Exceptional" :
                   overallScore >= 60 ? "✨ Proficient" :
                   overallScore >= 40 ? "📈 Developing" : "🌱 Beginner"} AI Collaboration Skills
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Breakdown */}
        <Card className="mb-12 shadow-premium border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              Dimension Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {result.scores.map((score, index) => {
                const Icon = dimensionIcons[index] || Brain;
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center p-6 rounded-xl border-2 hover:border-primary/50 transition-all hover-lift bg-gradient-to-br from-accent/20 to-transparent"
                  >
                    <div className="mb-4 p-3 rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CircularProgress 
                      value={score} 
                      size={100} 
                      strokeWidth={8}
                      className="mb-4"
                    />
                    <h3 className="font-semibold text-center text-sm leading-tight mb-1">
                      {dimensionNames[index]}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      <AnimatedNumber value={score} decimals={1} /> / 100
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="shadow-premium border-2">
          <CardHeader>
            <CardTitle className="text-xl">Share Your Achievement</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleShare} variant="gradient" className="flex-1" size="lg">
              <Share2 className="mr-2 h-5 w-5" />
              Generate Share Link
            </Button>
            <Button variant="outline" className="flex-1 hover:border-secondary hover:text-secondary" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Download Certificate
            </Button>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Button variant="ghost" size="lg" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
