import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Download, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "@/components/ShareModal";

interface TestResult {
  id: string;
  scores: number[];
  created_at: string;
  completed: boolean;
}

const dimensionNames = [
  "Strategic AI Understanding",
  "Prompt Engineering & Iteration",
  "Critical Evaluation & Calibration",
  "Intelligent Task Integration",
  "Adaptive Learning & Continuous Improvement",
  "Ethical Judgment & Use",
  "Context Sensitivity",
  "Creative Synthesis"
];

const Results = () => {
  const { testId } = useParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
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

  const handleGenerateShareablePost = async () => {
    if (!result) return;

    try {
      // Check if share record already exists
      const { data: existingShare } = await supabase
        .from("public_results")
        .select("share_code")
        .eq("test_id", result.id)
        .single();

      let shareCode: string;

      if (existingShare) {
        shareCode = existingShare.share_code;
      } else {
        // Generate new verification code in format: AIQ-YYYY-XXXX
        const year = new Date().getFullYear();
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        shareCode = `AIQ-${year}-${randomPart}`;

        const overallScore = result.scores.reduce((a, b) => a + b, 0) / result.scores.length;

        const { error } = await supabase.from("public_results").insert({
          test_id: result.id,
          user_id: (await supabase.auth.getUser()).data.user!.id,
          share_code: shareCode,
          overall_score: overallScore,
          dimension_scores: JSON.stringify(result.scores),
        });

        if (error) throw error;
      }

      setVerificationCode(shareCode);
      setShareModalOpen(true);
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
  
  const dimensionsWithNames = result.scores.map((score, index) => ({
    name: dimensionNames[index],
    score: score,
  }));

  const verificationUrl = verificationCode 
    ? `${window.location.origin}/shared/${verificationCode}`
    : "";

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} />
      
      <main className="container py-8 max-w-4xl">
        <div className="text-center mb-12">
          <Trophy className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">Your AIQ Results</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Test completed on {new Date(result.created_at).toLocaleDateString()}
          </p>
        </div>

        <Card className="mb-10 shadow-elegant">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl lg:text-3xl font-semibold mb-2">Overall AIQ Score</CardTitle>
            <div className="text-6xl lg:text-7xl font-bold text-primary tabular-nums tracking-tight">
              {overallScore.toFixed(1)}
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={overallScore} className="h-4 mb-6" />
            <p className="text-center text-xl font-semibold">
              {overallScore >= 80 ? "Exceptional" :
               overallScore >= 60 ? "Proficient" :
               overallScore >= 40 ? "Developing" : "Beginner"} AI Collaboration Skills
            </p>
          </CardContent>
        </Card>

        <Card className="mb-10 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl">Dimension Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {result.scores.map((score, index) => (
              <div key={index}>
                <div className="flex justify-between mb-3">
                  <span className="text-lg font-semibold">{dimensionNames[index]}</span>
                  <span className="text-xl font-bold tabular-nums">{score.toFixed(1)}</span>
                </div>
                <Progress value={score} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Share Your Results</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleGenerateShareablePost} className="flex-1 text-base" size="lg">
              <Share2 className="mr-2 h-5 w-5" />
              Generate Shareable Post
            </Button>
            <Button variant="outline" className="flex-1 text-base" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          score={overallScore}
          dimensions={dimensionsWithNames}
          verificationCode={verificationCode}
          verificationUrl={verificationUrl}
        />

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
