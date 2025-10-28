import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Download, Trophy, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "@/components/ShareModal";
import { generatePDFReport } from "@/lib/pdfGenerator";

interface TestResult {
  id: string;
  scores: number[];
  created_at: string;
  completed: boolean;
  test_duration_seconds: number;
  test_version?: string;
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

const dimensionCodeMap: Record<string, string> = {
  'SAU': 'Strategic AI Understanding',
  'PEI': 'Prompt Engineering & Iteration',
  'CEC': 'Critical Evaluation & Calibration',
  'ITI': 'Intelligent Task Integration',
  'ALC': 'Adaptive Learning & Continuous Improvement',
  'EJU': 'Ethical Judgment & Use',
  'CXS': 'Context Sensitivity',
  'CRS': 'Creative Synthesis',
};

const Results = () => {
  const { testId } = useParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [userName, setUserName] = useState<string>("");
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

      // Parse scores - handle both object and array formats
      let parsedScores = typeof data.scores === 'string' ? JSON.parse(data.scores) : data.scores;
      
      // Convert object to array if needed
      let scoresArray: number[];
      if (Array.isArray(parsedScores)) {
        scoresArray = parsedScores;
      } else if (typeof parsedScores === 'object' && parsedScores !== null) {
        // Convert object with dimension codes to array
        scoresArray = Object.keys(dimensionCodeMap).map(code => 
          parsedScores[code] || 0
        );
      } else {
        // Default to zeros if no scores
        scoresArray = new Array(8).fill(0);
      }

      setResult({
        id: data.id,
        scores: scoresArray,
        created_at: data.created_at,
        completed: data.completed,
        test_duration_seconds: data.test_duration_seconds || 0,
        test_version: data.test_version || 'beginner',
      });

      // Get user name from demographics (used for certificate)
      const { data: demographics } = await supabase
        .from("test_demographics")
        .select("full_name")
        .eq("test_id", testId)
        .maybeSingle();
      
      setUserName(demographics?.full_name || session.user.email || "AIQ Participant");
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

  const handleDownloadPDF = async () => {
    if (!result) return;

    setDownloadingPDF(true);
    try {
      const overallScore = result.scores.reduce((a, b) => a + b, 0) / result.scores.length;
      const dimensionsWithNames = result.scores.map((score, index) => ({
        name: dimensionNames[index],
        score: score,
      }));

      const issueDate = new Date(result.created_at);
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // Check if verification code exists, if not create one
      let code = verificationCode;
      if (!code) {
        const { data: existingShare } = await supabase
          .from("public_results")
          .select("share_code")
          .eq("test_id", result.id)
          .single();

        if (existingShare) {
          code = existingShare.share_code;
        } else {
          const year = new Date().getFullYear();
          const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
          code = `AIQ-${year}-${randomPart}`;

          const { error } = await supabase.from("public_results").insert({
            test_id: result.id,
            user_id: (await supabase.auth.getUser()).data.user!.id,
            share_code: code,
            overall_score: overallScore,
            dimension_scores: JSON.stringify(result.scores),
            user_name: userName,
            test_completion_date: result.created_at,
            test_duration_seconds: result.test_duration_seconds,
          });

          if (error) throw error;
        }
        setVerificationCode(code);
      }

      // Generate PDF
      const pdfBlob = await generatePDFReport(
        overallScore,
        dimensionsWithNames,
        code,
        issueDate,
        expiryDate,
        userName,
        result.test_duration_seconds
      );

      // Update report_generated_at
      await supabase
        .from("public_results")
        .update({ report_generated_at: new Date().toISOString() })
        .eq("share_code", code);

      // Download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AIQ-Certificate-${code}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded",
        description: "Your AIQ certificate has been downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloadingPDF(false);
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
        // Generate cryptographically secure verification code in format: AIQ-YYYY-XXXXXXXXXXXXXXXX
        const year = new Date().getFullYear();
        const randomPart = crypto.randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase();
        shareCode = `AIQ-${year}-${randomPart}`;

        const overallScore = result.scores.reduce((a, b) => a + b, 0) / result.scores.length;

        const { error } = await supabase.from("public_results").insert({
          test_id: result.id,
          user_id: (await supabase.auth.getUser()).data.user!.id,
          share_code: shareCode,
          overall_score: overallScore,
          dimension_scores: JSON.stringify(result.scores),
          user_name: userName,
          test_completion_date: result.created_at,
          test_duration_seconds: result.test_duration_seconds,
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
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-2 tracking-tight">{userName}</h1>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Your AIQ Results</h2>
          <p className="text-lg text-muted-foreground font-medium">
            Test completed on {new Date(result.created_at).toLocaleDateString()}
          </p>
          {result.test_duration_seconds > 0 && (
            <p className="text-md text-muted-foreground font-medium mt-1">
              Completed in {Math.floor(result.test_duration_seconds / 60)}m {result.test_duration_seconds % 60}s
            </p>
          )}
        </div>

        <Card className="mb-10 shadow-elegant">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl lg:text-3xl font-semibold mb-2">Overall AIQ Score</CardTitle>
            <div className="text-5xl lg:text-6xl font-bold text-primary tabular-nums tracking-tight">
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
            <Button variant="outline" className="flex-1 text-base" size="lg" onClick={handleDownloadPDF} disabled={downloadingPDF}>
              <Download className="mr-2 h-5 w-5" />
              {downloadingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </CardContent>
        </Card>

        {verificationCode && (
          <Card className="shadow-elegant mt-8">
            <CardHeader>
              <CardTitle className="text-xl">Certificate Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg">
                  {verificationCode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(verificationCode);
                    toast({
                      title: "Copied",
                      description: "Verification code copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Verify this certificate at: {window.location.origin}/verify/{verificationCode}
              </p>
            </CardContent>
          </Card>
        )}

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
