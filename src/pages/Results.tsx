import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Download, Trophy, Copy, ArrowRight, Calendar, Clock, Award, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
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
  "Creative Synthesis",
];

const dimensionCodeMap: Record<string, string> = {
  SAU: "Strategic AI Understanding",
  PEI: "Prompt Engineering & Iteration",
  CEC: "Critical Evaluation & Calibration",
  ITI: "Intelligent Task Integration",
  ALC: "Adaptive Learning & Continuous Improvement",
  EJU: "Ethical Judgment & Use",
  CXS: "Context Sensitivity",
  CRS: "Creative Synthesis",
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
    const {
      data: { session },
    } = await supabase.auth.getSession();

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
      let parsedScores = typeof data.scores === "string" ? JSON.parse(data.scores) : data.scores;

      // Convert object to array if needed
      let scoresArray: number[];
      if (Array.isArray(parsedScores)) {
        scoresArray = parsedScores;
      } else if (typeof parsedScores === "object" && parsedScores !== null) {
        // Convert object with dimension codes to array
        scoresArray = Object.keys(dimensionCodeMap).map((code) => parsedScores[code] || 0);
      } else {
        // Default to zeros if no scores
        scoresArray = new Array(8).fill(0);
      }

      setResult({
        id: data.id,
        scores: scoresArray,
        created_at: data.created_at,
        completed: data.completed,
        test_duration_seconds: Number(data.test_duration_seconds) || 0,
        test_version: data.test_version || "beginner",
      });

      // Get user's name from profile (registered name)
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setUserName(profile?.name || session.user.email || "AIQ™ Participant");
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
        code: Object.keys(dimensionCodeMap)[index] || '',
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

      // Generate PDF - ensure duration is a valid number
      const pdfBlob = await generatePDFReport(
        overallScore,
        dimensionsWithNames,
        code,
        issueDate,
        expiryDate,
        userName,
        result.test_duration_seconds || 0,
      );

      // Update report_generated_at
      await supabase
        .from("public_results")
        .update({ report_generated_at: new Date().toISOString() })
        .eq("share_code", code);

      // Download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
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
        const randomPart = crypto.randomUUID().replace(/-/g, "").substring(0, 16).toUpperCase();
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
        <div className="container py-12">
          <div className="text-center text-muted-foreground">Loading your results...</div>
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

  const verificationUrl = verificationCode ? `https://aiq.works/verify/${verificationCode}` : "";

  const getScoreLevel = (score: number) => {
    if (score >= 80)
      return {
        label: "Exceptional",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-950/20",
      };
    if (score >= 60)
      return { label: "Proficient", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" };
    if (score >= 40)
      return {
        label: "Developing",
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
      };
    return {
      label: "Beginner",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/20",
    };
  };

  const scoreLevel = getScoreLevel(overallScore);

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navigation isAuthenticated={true} />

      <main className="container py-8 max-w-5xl flex-grow">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-center mb-2 tracking-tight">
            Congratulations, {userName}!
          </h1>
          <p className="text-xl text-muted-foreground mb-4">You've completed the AIQ<sup className="text-[0.6em]">™</sup> Assessment</p>

          {/* Test Meta Info */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(result.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {result.test_duration_seconds > 0 && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.floor(result.test_duration_seconds / 60)}m {result.test_duration_seconds % 60}s
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className={`mb-6 shadow-sm border-2 ${scoreLevel.bg}`}>
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <p className="text-sm font-bold text-muted-foreground mb-2">Overall AIQ Score</p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`text-6xl font-black tabular-nums tracking-tight ${scoreLevel.color}`}>
                  {overallScore.toFixed(1)}
                </div>
                <div className="text-left">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${scoreLevel.bg} ${scoreLevel.color}`}
                  >
                    {scoreLevel.label}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                </div>
              </div>
              <Progress value={overallScore} className="h-3 max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="h-auto py-4 bg-blue-900 hover:bg-blue-800 font-semibold"
          >
            <Download className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="text-sm font-bold">{downloadingPDF ? "Generating..." : "Download Certificate"}</div>
              <div className="text-xs opacity-90">PDF with verification code</div>
            </div>
          </Button>
          <Button onClick={handleGenerateShareablePost} variant="outline" className="h-auto py-4 font-semibold">
            <Share2 className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="text-sm font-bold">Share Results</div>
              <div className="text-xs text-muted-foreground">Generate shareable post</div>
            </div>
          </Button>
        </div>

        {/* Dimension Breakdown */}
        <Card className="mb-6 shadow-sm border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Dimension Breakdown</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Your performance across 8 key areas</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {result.scores.map((score, index) => {
                const dimLevel = getScoreLevel(score);
                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold group-hover:text-primary transition-colors">
                          {dimensionNames[index]}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${dimLevel.bg} ${dimLevel.color}`}>
                          {dimLevel.label}
                        </span>
                        <span className="text-lg font-black tabular-nums w-12 text-right">{score.toFixed(1)}</span>
                      </div>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Verification Code Card */}
        {verificationCode && (
          <Card className="mb-6 shadow-sm border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black mb-1">Certificate Verification Code</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Share this code with employers or add it to your resume
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                      <code className="text-sm font-bold text-blue-900 dark:text-blue-100">{verificationCode}</code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(verificationCode);
                        toast({
                          title: "Copied!",
                          description: "Verification code copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
            Verify at:{" "}
            <span className="font-mono">
              aiq.works/verify
            </span>
          </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights */}
        <Card className="mb-6 shadow-sm border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-black">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Top Strengths */}
              <div>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <span className="text-green-600">✓</span> Top Strengths
                </h3>
                <div className="space-y-1">
                  {result.scores
                    .map((score, index) => ({ score, name: dimensionNames[index], index }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((dim) => (
                      <div
                        key={dim.index}
                        className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded"
                      >
                        <span className="font-medium">{dim.name}</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{dim.score.toFixed(1)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Areas for Growth */}
              <div>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <span className="text-blue-600">→</span> Areas for Growth
                </h3>
                <div className="space-y-1">
                  {result.scores
                    .map((score, index) => ({ score, name: dimensionNames[index], index }))
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                    .map((dim) => (
                      <div
                        key={dim.index}
                        className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded"
                      >
                        <span className="font-medium">{dim.name}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{dim.score.toFixed(1)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1 font-semibold">
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/about")} variant="outline" className="flex-1 font-semibold">
            Learn About AIQ<sup className="text-[0.6em]">™</sup>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Share Modal */}
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          score={overallScore}
          dimensions={dimensionsWithNames}
          verificationCode={verificationCode}
          verificationUrl={verificationUrl}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Results;
