import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { loadTestItems, type TestVersion } from "@/lib/adaptiveItemSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Share2,
  Download,
  Trophy,
  Copy,
  ArrowRight,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  Brain,
  User,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShareModal } from "@/components/ShareModal";
import { generatePDFReport } from "@/lib/pdfGenerator";
import { calculateTestScores } from "@/lib/scoreCalculator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAssessmentContext, getPerformanceDescriptor, type AssessmentContext } from "@/lib/assessmentUtils";

interface TestResult {
  id: string;
  scores: any; // Can be array or object
  answers: any;
  created_at: string;
  completed: boolean;
  test_duration_seconds: number;
  test_version?: string;
  product_id?: string;
  product_slug?: string;
  product_name?: string;
}

interface ScoringResult {
  dimensionScores: { [dimensionCode: string]: number };
  rawScores?: { [code: string]: { score: number; maxScore: number; percentage: number } };
  overallScore: number;
  totalPossiblePoints: number;
  passingScore: number;
  passed: boolean;
  percentageScore: number;
  correctCount: number;
  totalCount: number;
  assessmentLevel: string;
  scoringGuidelines: { [key: string]: string };
  performanceLevel: string;
  failedDimensions?: string[];
  dimensionMinimumRequired?: number;
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
  PEI: "Prompt Engineering Intelligence",
  CEC: "Critical Evaluation Capability",
  II: "Integration Intelligence",
  ALC: "Adaptive Learning Capability",
  EJC: "Ethical Judgment in AI Utilization",
  CS: "Context Sensitivity",
  CRS: "Creative Reasoning Synthesis",
};

const Results = () => {
  const { testId } = useParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [recommendations, setRecommendations] = useState<{ [key: string]: string[] }>({});
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [assessmentContext, setAssessmentContext] = useState<AssessmentContext | null>(null);
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
      navigate("/sign-in");
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

      // Fetch product details if product_slug exists
      let productName: string | undefined;
      let productId: string | undefined;
      let context: AssessmentContext | null = null;
      
      if (data.product_slug) {
        const { data: product } = await supabase
          .from("assessment_products")
          .select("*")
          .eq("slug", data.product_slug)
          .maybeSingle();
        
        if (product) {
          productName = product.name;
          productId = product.id;
          
          // Create assessment context
          context = getAssessmentContext(
            product.name,
            product.slug,
            product.age_group,
            product.track,
            product.role
          );
          
          setAssessmentContext(context);
        }
      }

      // Store test data
      setResult({
        id: data.id,
        scores: data.scores,
        answers: data.answers,
        created_at: data.created_at,
        completed: data.completed,
        test_duration_seconds: Number(data.test_duration_seconds) || 0,
        test_version: data.test_version || "beginner",
        product_id: productId || data.product_id,
        product_slug: data.product_slug,
        product_name: productName,
      });

      // Use scores from database (calculated securely server-side)
      const testVersion = (() => {
        const rawVersion = data.test_version || "beginner";
        if (rawVersion === 'professional' || rawVersion === 'expert') {
          return 'advanced';
        }
        return rawVersion as TestVersion;
      })();

      // Parse nested score objects from server response
      const rawScores = data.scores || {};
      
      // Extract actual scores from nested objects
      const dimensionScores: { [key: string]: number } = {};
      let totalScore = 0;
      let totalMaxScore = 0;

      Object.entries(rawScores).forEach(([code, scoreData]) => {
        if (typeof scoreData === 'object' && scoreData !== null) {
          const sd = scoreData as { score: number; maxScore: number; percentage: number };
          dimensionScores[code] = sd.score || 0;
          totalScore += sd.score || 0;
          totalMaxScore += sd.maxScore || 0;
        } else {
          // Fallback for flat number format (legacy)
          dimensionScores[code] = scoreData as number || 0;
          totalScore += scoreData as number || 0;
        }
      });

      const overallScore = totalScore;
      const totalPossiblePoints = totalMaxScore || 240; // Dynamic from actual scores
      const percentageScore = totalPossiblePoints > 0 ? (overallScore / totalPossiblePoints) * 100 : 0;
      const passingPercentage = 70; // From assessment config
      const passingScore = Math.floor(totalPossiblePoints * (passingPercentage / 100));
      const passed = percentageScore >= passingPercentage;

      const enrichedScores: any = {
        dimensionScores,
        rawScores,
        overallScore,
        totalPossiblePoints,
        passingScore,
        passed,
        percentageScore,
        correctCount: 0,
        totalCount: 0,
        assessmentLevel: testVersion,
        scoringGuidelines: {},
        performanceLevel: "Novice"
      };

      setScoringResult(enrichedScores);
      setIsPassed(passed);

      // Extract bottom 3 dimensions for recommendations (sorted by percentage)
      const sortedDimensions = Object.entries(rawScores)
        .map(([code, scoreData]) => {
          if (typeof scoreData === 'object' && scoreData !== null) {
            const sd = scoreData as { score: number; maxScore: number; percentage: number };
            return { code, score: sd.score || 0, percentage: sd.percentage || 0 };
          }
          return { code, score: scoreData as number || 0, percentage: 0 };
        })
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 3);

      // Load recommendations with assessment context
      const slugToLoad = data.product_slug || testVersion;
      try {
        const assessmentData = await loadTestItems(slugToLoad, data.id, supabase, true);
        await extractRecommendations(testVersion, sortedDimensions, enrichedScores.passed, assessmentData);
      } catch (error) {
        console.error('Could not load recommendations:', error);
        // Continue without recommendations
      }

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
    if (!result || !scoringResult) return;

    // Check if user passed
    if (!scoringResult.passed) {
      toast({
        title: "Certificate Not Available",
        description: `You need a passing score of ${scoringResult.passingScore} points to download your certificate. You scored ${scoringResult.overallScore} points.`,
        variant: "destructive",
      });
      return;
    }

    // Check if user met minimum dimension requirements
    if (scoringResult.failedDimensions && scoringResult.failedDimensions.length > 0) {
      toast({
        title: "Certificate Not Available",
        description: `You did not meet the minimum requirement of ${scoringResult.dimensionMinimumRequired}% in the following dimensions: ${scoringResult.failedDimensions.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setDownloadingPDF(true);
    try {
      // Convert dimension scores to array format for PDF
      const dimensionsWithNames = Object.keys(dimensionCodeMap).map((code, index) => ({
        code,
        name: dimensionNames[index],
        score: scoringResult.dimensionScores[code] || 0,
      }));

      const issueDate = new Date(result.created_at);
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // Check if verification code exists, if not create one with high entropy
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
          // Generate cryptographically secure verification code in format: AIQ-YYYY-XXXXXXXXXXXXXXXX
          // Uses same format as social share for consistency
          const year = new Date().getFullYear();
          const randomPart = crypto.randomUUID().replace(/-/g, "").substring(0, 16).toUpperCase();
          code = `AIQ-${year}-${randomPart}`;

          const { error } = await supabase.from("public_results").insert({
            test_id: result.id,
            user_id: (await supabase.auth.getUser()).data.user!.id,
            share_code: code,
            overall_score: Number(scoringResult.overallScore.toFixed(1)), // Store actual points with 1 decimal
            dimension_scores: JSON.stringify(scoringResult.dimensionScores),
            user_name: userName,
            test_completion_date: result.created_at,
            test_duration_seconds: result.test_duration_seconds,
            test_version: result.test_version || 'professional',
            product_id: result.product_id,
            product_slug: result.product_slug,
          });

          if (error) throw error;
        }
        setVerificationCode(code);
      }

      // Generate PDF with new scoring data
      const pdfBlob = await generatePDFReport(
        scoringResult.overallScore, // Pass actual points earned
        dimensionsWithNames,
        code,
        issueDate,
        expiryDate,
        userName,
        result.test_duration_seconds || 0,
        result.test_version || 'professional',
        scoringResult, // Pass full scoring result for validation
        assessmentContext || undefined // Pass assessment context
      );

      // Update report_generated_at
      await supabase
        .from("public_results")
        .update({ report_generated_at: new Date().toISOString() })
        .eq("share_code", code);

      // Also update test_version if not already stored
      await supabase
        .from("public_results")
        .update({ test_version: result.test_version || 'professional' })
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
        description: "Your AIQ™ certificate has been downloaded",
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

  const extractRecommendations = async (
    testVersion: string,
    weakDimensions: { code: string; score: number }[],
    isPassing: boolean,
    assessmentData: any
  ) => {
    setLoadingRecommendations(true);
    try {
      // Import recommendation selector
      const { getRecommendations } = await import("@/lib/recommendationsSelector");
      
      const recs: { [key: string]: string[] } = {};
      const maxPoints = assessmentData.scoringConfiguration.pointsPerDimension;
      
      console.log("📊 Extracting recommendations with maxPoints:", maxPoints);

      // For each weak dimension, get performance-aware recommendations
      weakDimensions.forEach(({ code, score }) => {
        const percentage = (score / maxPoints) * 100;
        console.log(`📌 Dimension ${code}: ${score}/${maxPoints} = ${percentage.toFixed(1)}%`);
        recs[code] = getRecommendations(code, percentage, testVersion, assessmentContext || undefined);
      });

      console.log("✅ Loaded recommendations:", recs);
      setRecommendations(recs);
    } catch (error) {
      console.error("❌ Failed to load recommendations:", error);
      setRecommendations({});
    } finally {
      setLoadingRecommendations(false);
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

          const { error } = await supabase.from("public_results").insert({
            test_id: result.id,
            user_id: (await supabase.auth.getUser()).data.user!.id,
            share_code: shareCode,
            overall_score: Number((scoringResult?.overallScore || 0).toFixed(1)), // Store actual points with 1 decimal
            dimension_scores: JSON.stringify(scoringResult?.dimensionScores || {}),
            user_name: userName,
            test_completion_date: result.created_at,
            test_duration_seconds: result.test_duration_seconds,
            test_version: result.test_version || 'professional',
            product_id: result.product_id,
            product_slug: result.product_slug,
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

  if (!result || !scoringResult) {
    return null;
  }

  const dimensionsWithNames = Object.keys(dimensionCodeMap).map((code, index) => {
    const rawScoreData = result.scores?.[code];
    let score = 0;
    let maxScore = 30; // Default per dimension
    
    if (typeof rawScoreData === 'object' && rawScoreData !== null) {
      score = (rawScoreData as any).score || 0;
      maxScore = (rawScoreData as any).maxScore || 30;
    } else if (typeof rawScoreData === 'number') {
      score = rawScoreData;
    }
    
    return {
      code,
      name: dimensionNames[index],
      score,
      maxScore,
    };
  });

  const verificationUrl = verificationCode ? `https://aiq.works/verify-certificate/${verificationCode}` : "";

  const getScoreLevel = (points: number) => {
    // Calculate percentage based on points per dimension, not total
    const maxPointsPerDimension = scoringResult.totalPossiblePoints / 8;
    const percentage = (points / maxPointsPerDimension) * 100;
    
    let label = "Emerging";
    let color = "text-orange-600 dark:text-orange-400";
    let bg = "bg-orange-50 dark:bg-orange-950/20";
    
    // Use assessment context if available
    if (assessmentContext) {
      label = getPerformanceDescriptor(percentage, assessmentContext);
      // Set colors based on label
      if (label === "Outstanding" || label === "Advanced" || label === "Expert" || label === "Master") {
        color = "text-green-600 dark:text-green-400";
        bg = "bg-green-50 dark:bg-green-950/20";
      } else if (label === "Excellent" || label === "Proficient") {
        color = "text-blue-600 dark:text-blue-400";
        bg = "bg-blue-50 dark:bg-blue-950/20";
      } else if (label === "Good Progress" || label === "Developing") {
        color = "text-yellow-600 dark:text-yellow-400";
        bg = "bg-yellow-50 dark:bg-yellow-950/20";
      }
      return { label, color, bg };
    }
    
    // Fallback to test version
    const testVersion = result?.test_version || 'professional';
    if (testVersion.includes("beginner")) {
      // Beginner thresholds
      if (percentage >= 91) {
        label = "Advanced";
        color = "text-green-600 dark:text-green-400";
        bg = "bg-green-50 dark:bg-green-950/20";
      } else if (percentage >= 81) {
        label = "Proficient";
        color = "text-blue-600 dark:text-blue-400";
        bg = "bg-blue-50 dark:bg-blue-950/20";
      } else if (percentage >= 61) {
        label = "Developing";
        color = "text-yellow-600 dark:text-yellow-400";
        bg = "bg-yellow-50 dark:bg-yellow-950/20";
      } else if (percentage >= 41) {
        label = "Beginner";
        color = "text-orange-600 dark:text-orange-400";
        bg = "bg-orange-50 dark:bg-orange-950/20";
      } else {
        label = "Novice";
        color = "text-red-600 dark:text-red-400";
        bg = "bg-red-50 dark:bg-red-950/20";
      }
    } else if (testVersion.includes("professional")) {
      // Professional thresholds
      if (percentage >= 91) {
        label = "Expert";
        color = "text-green-600 dark:text-green-400";
        bg = "bg-green-50 dark:bg-green-950/20";
      } else if (percentage >= 81) {
        label = "Advanced";
        color = "text-blue-600 dark:text-blue-400";
        bg = "bg-blue-50 dark:bg-blue-950/20";
      } else if (percentage >= 61) {
        label = "Proficient";
        color = "text-blue-600 dark:text-blue-400";
        bg = "bg-blue-50 dark:bg-blue-950/20";
      } else if (percentage >= 41) {
        label = "Developing";
        color = "text-yellow-600 dark:text-yellow-400";
        bg = "bg-yellow-50 dark:bg-yellow-950/20";
      } else {
        label = "Emerging";
        color = "text-orange-600 dark:text-orange-400";
        bg = "bg-orange-50 dark:bg-orange-950/20";
      }
    } else {
      // Expert thresholds
      if (percentage >= 96) {
        label = "Master";
        color = "text-purple-600 dark:text-purple-400";
        bg = "bg-purple-50 dark:bg-purple-950/20";
      } else if (percentage >= 86) {
        label = "Expert";
        color = "text-green-600 dark:text-green-400";
        bg = "bg-green-50 dark:bg-green-950/20";
      } else if (percentage >= 71) {
        label = "Advanced";
        color = "text-blue-600 dark:text-blue-400";
        bg = "bg-blue-50 dark:bg-blue-950/20";
      } else if (percentage >= 51) {
        label = "Proficient";
        color = "text-blue-600 dark:text-blue-400";
        bg = "bg-blue-50 dark:bg-blue-950/20";
      } else {
        label = "Developing";
        color = "text-yellow-600 dark:text-yellow-400";
        bg = "bg-yellow-50 dark:bg-yellow-950/20";
      }
    }
    
    return { label, color, bg };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation isAuthenticated={true} />
      
      {/* Official Header with Logo */}
      <div className="bg-white dark:bg-gray-900 border-b-2 py-8">
        <div className="container max-w-5xl">
          <div className="text-center">
            {assessmentContext?.isAdolescent ? (
              <GraduationCap className="w-20 h-20 mx-auto mb-4 text-primary" />
            ) : assessmentContext?.type === 'role-specific' ? (
              <Briefcase className="w-20 h-20 mx-auto mb-4 text-primary" />
            ) : (
              <Brain className="w-20 h-20 mx-auto mb-4 text-primary" />
            )}
            <h1 className="font-serif text-4xl font-bold mb-2">Official Score Report</h1>
            <p className="text-lg text-muted-foreground">
              {assessmentContext?.displayTitle || 'AIQ Assessment™'}
            </p>
            {assessmentContext?.isAdolescent && assessmentContext.ageGroup && (
              <p className="text-sm text-muted-foreground mt-1">
                Student Track • Ages {assessmentContext.ageGroup}
              </p>
            )}
            {assessmentContext?.type === 'role-specific' && (
              <p className="text-sm text-muted-foreground mt-1">
                Professional Track • {assessmentContext.role}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{userName || 'Test Taker'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(result.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(result.test_duration_seconds / 60)} minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-5xl py-12 space-y-8">
        {/* Pass/Fail Banner */}
        {scoringResult.passed ? (
          <Alert className="border-2 border-success bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <AlertTitle className="text-lg font-bold text-success">Assessment Passed</AlertTitle>
            <AlertDescription className="text-success">
              Congratulations! You have successfully demonstrated proficiency in AI collaboration and intelligence.
              You are eligible to receive your official certificate.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-2 border-destructive bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-lg font-bold text-destructive">Assessment Not Passed</AlertTitle>
            <AlertDescription className="text-destructive">
              You did not meet the passing criteria. Review your dimension scores below and consider 
              retaking the assessment after additional preparation.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Overall Score Summary Card */}
        <Card className="test-card">
          <CardHeader className="test-section-header">
            <h2 className="font-serif text-2xl font-bold">Overall Performance Summary</h2>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              {/* Total Score */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Total Score</p>
                <p className="text-6xl font-bold text-primary mb-2 tabular-nums">
                  {scoringResult.overallScore}
                </p>
                <p className="text-sm text-muted-foreground">
                  out of {scoringResult.totalPossiblePoints} points
                </p>
              </div>
              
              {/* Percentage */}
              <div className="text-center border-x-2">
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Score Percentage</p>
                <p className="text-6xl font-bold text-primary mb-2 tabular-nums">
                  {Math.round(scoringResult.percentageScore)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Performance Level
                </p>
              </div>
              
              {/* Status */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Status</p>
                {scoringResult.passed ? (
                  <div>
                    <CheckCircle2 className="w-20 h-20 mx-auto text-success mb-2" />
                    <p className="text-2xl font-bold text-success uppercase tracking-wide">PASSED</p>
                  </div>
                ) : (
                  <div>
                    <AlertCircle className="w-20 h-20 mx-auto text-destructive mb-2" />
                    <p className="text-2xl font-bold text-destructive uppercase tracking-wide">NOT PASSED</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Performance Level Badge */}
            <div className="text-center pt-6 border-t-2">
              <p className="text-sm text-muted-foreground mb-2">Performance Classification</p>
              <span className="inline-flex px-6 py-2 bg-primary/10 text-primary text-lg font-bold rounded-full">
                {scoringResult.performanceLevel}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Dimension Analysis */}
        <Card className="test-card">
          <CardHeader className="test-section-header">
            <h2 className="font-serif text-2xl font-bold">Dimension Analysis</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed breakdown of your performance across all 8 AIQ dimensions
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2">
              {dimensionsWithNames.map((dim, idx) => {
                const maxScore = dim.maxScore || (scoringResult.totalPossiblePoints / 8);
                const percentage = maxScore > 0 ? (dim.score / maxScore) * 100 : 0;
                const { label, color, bg } = getScoreLevel(dim.score);
                
                return (
                  <div key={idx} className="p-6 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{dim.name}</h4>
                        <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-semibold rounded ${bg} ${color}`}>
                          {label}
                        </span>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold tabular-nums">{dim.score}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {percentage.toFixed(1)}% proficiency • {dim.score} of {maxScore.toFixed(0)} points
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          {scoringResult.passed && (
            <Button 
              size="lg" 
              className="professional" 
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
            >
              <Download className="w-5 h-5 mr-2" />
              {downloadingPDF ? 'Generating...' : 'Download Official Certificate'}
            </Button>
          )}
          <Button 
            size="lg" 
            variant="outline"
            onClick={handleGenerateShareablePost}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Results
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/about')}
          >
            <Lightbulb className="w-5 h-5 mr-2" />
            Learn More About AIQ
          </Button>
        </div>
      </div>
      
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        score={scoringResult.overallScore}
        totalPossible={scoringResult.totalPossiblePoints}
        dimensions={dimensionsWithNames}
        verificationCode={verificationCode}
        verificationUrl={verificationUrl}
        passed={scoringResult.passed}
        assessmentContext={assessmentContext || undefined}
      />
    </div>
  );
};

export default Results;
