import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { loadTestItems, type Dimension, type TestVersion } from "@/lib/adaptiveItemSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Pause,
  Shield,
  FileText,
  Brain,
  User,
  GripVertical,
  ArrowUpDown,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrueFalseQuestion } from "@/components/TrueFalseQuestion";
import { SecurityConsentDialog } from "@/components/SecurityConsentDialog";
import { AIBlocker } from "@/components/AIBlocker";
import { toast as sonnerToast } from "sonner";

interface ConsentData {
  dataCollection: boolean;
  researchParticipation: boolean;
  ageConfirmation: boolean;
}

interface DemographicsData {
  age: string;
  gender: string;
  education: string;
  occupation: string;
  aiExperience: string;
  industry: string;
  country: string;
}

// Utility to parse question text and separate list items
const parseQuestionText = (text: string) => {
  if (!text) return { main: '', items: [] };
  
  // Patterns to detect list items: "1.", "2.", "a)", "b)", "(a)", "(b)", "A.", "B."
  const listPattern = /^(?:\d+\.|[a-zA-Z]\)|\([a-zA-Z]\)|[a-zA-Z]\.)\s/;
  const lines = text.split('\n').filter(line => line.trim());
  
  const mainQuestion: string[] = [];
  const listItems: string[] = [];
  
  for (const line of lines) {
    if (listPattern.test(line.trim())) {
      listItems.push(line.trim());
    } else {
      mainQuestion.push(line);
    }
  }
  
  return {
    main: mainQuestion.join(' ').trim(),
    items: listItems
  };
};

const Test = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // Will be set from assessment
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [scoringConfig, setScoringConfig] = useState<any>(null);
  const [assessmentInfo, setAssessmentInfo] = useState<any>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  
  // Security consent states
  const [showSecurityConsent, setShowSecurityConsent] = useState(true);
  const [securityConsentGiven, setSecurityConsentGiven] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [testTerminated, setTestTerminated] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  
  const [showConsent, setShowConsent] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);
  const [consentData, setConsentData] = useState<ConsentData>({
    dataCollection: false,
    researchParticipation: false,
    ageConfirmation: false
  });
  const [demographicsData, setDemographicsData] = useState<DemographicsData>(() => {
    // Auto-populate age for adolescent assessments from slug
    const productParam = searchParams.get("product");
    const autoAge = extractAgeFromSlug(productParam);
    
    return {
      age: autoAge || '',
      gender: '',
      education: '',
      occupation: '',
      aiExperience: '',
      industry: '',
      country: ''
    };
  });

  // State for rank-ordering questions (drag and drop)
  const [rankOrder, setRankOrder] = useState<number[]>([]);
  
  // State for matching questions
  const [matchingPairs, setMatchingPairs] = useState<Record<number, number>>({});

  // Helper to detect adolescent assessments
  const isAdolescentSlug = (slug?: string | null): boolean => {
    return !!slug && slug.startsWith('adolescent-');
  };
  
  // Helper to extract age from adolescent slug
  function extractAgeFromSlug(slug?: string | null): string | null {
    if (!slug || !slug.startsWith('adolescent-')) return null;
    // Extract age from slug like 'adolescent-14-15' or 'adolescent-16-17'
    const match = slug.match(/adolescent-(\d+-\d+)/);
    return match ? match[1] : null;
  }

  // Helper to normalize version for database
  const deriveTestVersionFromSlugOrVersion = (input: string): 'beginner' | 'advanced' => {
    if (input.includes('advanced')) return 'advanced';
    return 'beginner';
  };

  const [version, setVersion] = useState<TestVersion>(() => {
    const versionParam = searchParams.get('version') as string;
    const productParam = searchParams.get('product') as string;
    
    // If product param exists, normalize it
    if (productParam) {
      return deriveTestVersionFromSlugOrVersion(productParam) as TestVersion;
    }
    
    // Map old values to new structure for backward compatibility
    if (versionParam === 'professional' || versionParam === 'expert') {
      return 'advanced';
    }
    return (versionParam as TestVersion) || 'beginner';
  });
  const resumeId = searchParams.get('resume');
  
  // Check if this is an adolescent assessment
  const isAdolescent = isAdolescentSlug(productSlug || searchParams.get('product'));

  // Dynamic values from loaded assessment
  const questionsPerDimension = assessmentInfo?.questionCount 
    ? Math.floor(assessmentInfo.questionCount / (dimensions.length || 8))
    : 8;
  const totalQuestions = assessmentInfo?.questionCount || 60;
  const testDuration = assessmentInfo?.totalTime 
    ? assessmentInfo.totalTime * 60  // Convert minutes to seconds
    : 3600;

  useEffect(() => {
    initializeTest();
  }, []);

  useEffect(() => {
    loadTestData();
  }, [version]);

  // Auto-show consent dialog once assessment data is loaded
  useEffect(() => {
    if (
      !loading &&
      assessmentInfo &&
      securityConsentGiven &&
      !showConsent &&
      !showDemographics &&
      !resumeId &&
      !testStarted &&
      !testId
    ) {
      setShowConsent(true);
    }
  }, [loading, assessmentInfo, securityConsentGiven, showConsent, showDemographics, resumeId, testStarted, testId]);

  useEffect(() => {
    if (!showConsent && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit on time expiry (allow even if not all questions are answered)
            handleSubmitTest({ force: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showConsent, timeRemaining]);

  // Auto-pause test when user closes tab or navigates away (NEVER delete)
  useEffect(() => {
    if (!testId || showConsent || showDemographics) return;

    const autoPauseTest = async () => {
      try {
        // Use sendBeacon for reliable last-moment data sending
        const payload = JSON.stringify({
          paused: true,
          time_remaining: timeRemaining,
          current_dimension: currentDimension,
          current_item: currentQuestion,
          answers: answers
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Use fetch with keepalive for better reliability during page unload
        // Only PAUSE the test, never delete it - users can resume or delete from dashboard
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tests?id=eq.${testId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: payload,
          keepalive: true // Critical for page unload scenarios
        });
      } catch (error) {
        console.error("Failed to auto-pause test:", error);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      autoPauseTest();
      // Show confirmation dialog
      e.preventDefault();
      e.returnValue = '';
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        autoPauseTest();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testId, showConsent, showDemographics, timeRemaining, currentDimension, currentQuestion, answers]);

  // Questions are ready to display (no initialization needed for current types)

  const loadTestData = async () => {
    // Skip if we're resuming (will be handled in initializeTest)
    if (resumeId) {
      console.log('[Test] Skipping loadTestData - resuming test');
      return;
    }
    
    try {
      console.log('[Test] Loading product metadata for:', version);
      setLoadError(null);
      
      let slugToLoad: string = version; // Default fallback
      
      // Try to fetch product metadata from database
      const productParam = searchParams.get("product");
      if (productParam) {
        const { data: product, error: productError } = await supabase
          .from("assessment_products")
          .select("*")
          .eq("slug", productParam)
          .eq("is_active", true)
          .maybeSingle();
        
        if (!productError && product) {
          setProductId(product.id);
          setProductSlug(product.slug);
          slugToLoad = product.slug;
          
          // Set basic assessment info from product metadata
          setAssessmentInfo({
            name: product.name,
            totalTime: product.duration_minutes,
            questionCount: product.question_count,
            description: product.description
          });
          
          // Set initial time remaining
          setTimeRemaining(product.duration_minutes * 60);
          
          console.log('[Test] Loaded product metadata:', product.name);
        }
      }
      
      setLoading(false);
    } catch (error: any) {
      const errorMsg = error.message || "Failed to load product metadata";
      console.error('[Test] Error loading test data:', errorMsg, error);
      setLoadError(errorMsg);
      toast({
        title: "Error Loading Test",
        description: errorMsg,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const initializeTest = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        // Ensure we clear auth checking state even if navigation fails
        setIsAuthChecking(false);
        navigate(`/auth?returnTo=${returnUrl}`);
        return;
      }
      
      setIsAuthChecking(false);

      if (resumeId) {
        // Skip consent/demographics for resumed tests immediately
        setShowConsent(false);
        setShowDemographics(false);
        
      // Resume existing test - skip security consent for resume
      setShowSecurityConsent(false);
      setSecurityConsentGiven(true);
      
      const { data: testData, error } = await supabase
        .from("tests")
        .select("*")
        .eq("id", resumeId)
        .maybeSingle();

        if (error) throw error;
        if (!testData) {
          toast({
            title: "Test Not Found",
            description: "We couldn't find that paused test. It may have been deleted.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setTestId(testData.id);
        const resumedVersion = (testData.test_version === 'professional' || testData.test_version === 'expert') ? 'advanced' : ((testData.test_version as TestVersion) || 'beginner');
        setVersion(resumedVersion);
        
        // Load dimensions securely via edge function
        const slugToLoad = testData.product_slug || resumedVersion;
        const assessmentData = await loadTestItems(slugToLoad, testData.id, supabase, true);
        setDimensions(assessmentData.dimensions);
        setScoringConfig(assessmentData.scoringConfiguration);
        setAssessmentInfo(assessmentData.assessmentInfo);
        
        // Validate and set dimension/question indices with boundary checks
        let validDimension = testData.current_dimension || 0;
        let validQuestion = testData.current_item || 0;
        
        if (validDimension >= assessmentData.dimensions.length) {
          validDimension = Math.max(0, assessmentData.dimensions.length - 1);
        }
        
        if (assessmentData.dimensions[validDimension]?.items) {
          const itemsInDimension = assessmentData.dimensions[validDimension].items.length;
          if (validQuestion >= itemsInDimension) {
            validQuestion = Math.max(0, itemsInDimension - 1);
          }
        }
        
        setCurrentDimension(validDimension);
        setCurrentQuestion(validQuestion);
        
        // Use assessment duration or fallback to saved time_remaining
        const defaultDuration = assessmentData.assessmentInfo.totalTime * 60; // Convert to seconds
        setTimeRemaining(typeof testData.time_remaining === 'number' ? testData.time_remaining : defaultDuration);
        setAnswers((testData.answers as Record<string, string>) || {});
        
        // Ensure test_started is true when resuming (should already be true, but just in case)
        if (!testData.test_started) {
          await supabase
            .from("tests")
            .update({ test_started: true })
            .eq("id", testData.id);
        }
        
        setTestStarted(true);
        
        // Finished loading - hide loading state
        setLoading(false);
        
        toast({
          title: "Test Resumed",
          description: `Resuming from question ${validQuestion + 1} in ${assessmentData.dimensions[validDimension]?.dimensionName || 'dimension ' + (validDimension + 1)}`,
        });
      } else {
        // New test - will set time from loaded assessment in loadTestData
        setLoading(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsAuthChecking(false);
      setLoading(false);
    }
  };

  const handleConsentSubmit = () => {
    if (!consentData.dataCollection || (!isAdolescent && !consentData.ageConfirmation)) {
      toast({
        title: "Consent Required",
        description: "Please accept the required terms to continue",
        variant: "destructive",
      });
      return;
    }

    // Wait for assessment info to load before showing demographics
    if (!assessmentInfo || loading) {
      toast({
        title: "Loading Assessment",
        description: "Please wait while we load the assessment details...",
      });
      return;
    }

    setShowConsent(false);
    setShowDemographics(true);
  };
  
  const handleSecurityConsentAccept = () => {
    setSecurityConsentGiven(true);
    setShowSecurityConsent(false);
    // Only show consent after assessment data is loaded
    if (!loading && assessmentInfo) {
      setShowConsent(true);
    }
  };
  
  const handleSecurityConsentDecline = () => {
    sonnerToast.error("Security consent is required to take the assessment");
    navigate("/");
  };
  
  const handleSecurityViolation = async (violationType: string) => {
    const newCount = violationCount + 1;
    setViolationCount(newCount);
    
    // Special warning at 2 violations
    if (newCount === 2) {
      sonnerToast.warning(`Final Warning: ${newCount}/3 Violations`, {
        description: "⚠️ 1 more violation will terminate and delete your test permanently!",
        duration: 8000,
      });
    } else if (newCount < 2) {
      sonnerToast.error(`Security Violation ${newCount}/3`, {
        description: violationType,
        duration: 5000,
      });
    }
    
    // Terminate and delete test after 3 violations
    if (newCount >= 3) {
      setTestTerminated(true);
      
      if (testId) {
        // Delete the test - cascade will remove all related records
        await supabase
          .from('tests')
          .delete()
          .eq('id', testId);
      }
      
      sonnerToast.error("Assessment Terminated & Deleted", {
        description: "Too many security violations detected. Your test has been terminated and removed.",
        duration: 10000,
      });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }
  };

  const handleDemographicsSubmit = async () => {
    // Validate required fields (age auto-populated for adolescent assessments)
    if (!demographicsData.age || !demographicsData.gender || !demographicsData.education || 
        !demographicsData.aiExperience) {
      toast({
        title: "Required Information",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Use dynamic test duration from assessment metadata
      const initialTimeRemaining = assessmentInfo?.totalTime 
        ? assessmentInfo.totalTime * 60 
        : 3600;
      
      // Create test record (rate limits don't apply yet)
      const { data: newTest, error } = await supabase
        .from("tests")
        .insert([{
          user_id: session.user.id,
          test_version: version,
          json_version: version,
          consent_given: true,
          security_consent_given: true,
          time_remaining: initialTimeRemaining,
          current_dimension: 0,
          current_item: 0,
          answers: {},
          product_id: productId,
          product_slug: productSlug,
          test_started: false // Not started yet, just created
        }])
        .select()
        .single();

      if (error) throw error;

      // Insert demographics data
      const { error: demographicsError } = await supabase
        .from("test_demographics")
        .insert([{
          user_id: session.user.id,
          test_id: newTest.id,
          full_name: "Not collected",
          phone_number: null,
          job_role: demographicsData.occupation || "Not specified",
          organization_type: "Not specified",
          organization_size: null,
          industry_sector: demographicsData.industry || "Not specified",
          years_experience: "Not specified",
          ai_familiarity: demographicsData.aiExperience,
          ai_tools_used: [],
          ai_usage_frequency: "Not specified",
          ai_use_cases: [],
          ai_training: "Not specified",
          assessment_reasons: [],
          assessment_tier: version,
          results_usage: [],
          age_range: demographicsData.age,
          education_level: demographicsData.education,
          country: demographicsData.country || null,
          primary_language: null,
          technical_background: null,
          consent_assessment: true,
          consent_data_usage: true,
          consent_security_monitoring: true,
          consent_results_access: true,
          consent_research: consentData.researchParticipation || false,
          consent_communications: false,
        }]);

      if (demographicsError) throw demographicsError;

      setTestId(newTest.id);
      
      // NOW load the actual assessment questions via secure edge function
      const slugToLoad = productSlug || version;
      const assessmentData = await loadTestItems(slugToLoad, newTest.id, supabase, true);
      
      console.log('[Test] Assessment questions loaded securely:', {
        dimensionsCount: assessmentData.dimensions.length,
        totalItems: assessmentData.dimensions.reduce((sum, d) => sum + d.items.length, 0)
      });
      
      setDimensions(assessmentData.dimensions);
      setScoringConfig(assessmentData.scoringConfiguration);
      
      setShowDemographics(false);
      
      // Mark test as started NOW (when first question is displayed)
      // This is where rate limits are checked
      const { error: startError } = await supabase
        .from("tests")
        .update({ test_started: true })
        .eq("id", newTest.id);
      
      if (startError) {
        // Rate limit error - delete the test we just created
        await supabase.from("tests").delete().eq("id", newTest.id);
        throw startError;
      }
      
      setTestStarted(true); // Activate AIBlocker now that test is starting
      
      // Scroll to top when test starts
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast({
        title: "Assessment Started",
        description: "Good luck! Remember to read each question carefully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePauseTest = async () => {
    if (!testId) return;

    try {
      await supabase
        .from("tests")
        .update({
          paused: true,
          time_remaining: timeRemaining,
          current_dimension: currentDimension,
          current_item: currentQuestion,
          answers: answers
        })
        .eq("id", testId);

      toast({
        title: "Test Paused",
        description: "Your progress has been saved. Resume anytime from your dashboard.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitTest = async (opts?: { force?: boolean }) => {
    if (!testId) return;

    const answeredCount = Object.keys(answers).length;
    const actualTotal = dimensions?.reduce((sum, dim) => sum + (dim.items?.length ?? 0), 0) ?? 0;
    if (!opts?.force && answeredCount < actualTotal) {
      toast({
        title: "Incomplete assessment",
        description: `Please answer all questions before submitting (${answeredCount}/${actualTotal})`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the secure score-test edge function
      console.log('[Test] Calling score-test edge function for test:', testId);
      
      const { data: scoreData, error: scoreError } = await supabase.functions.invoke('score-test', {
        body: { 
          testId, 
          answers 
        }
      });

      if (scoreError) throw scoreError;

      console.log('[Test] Scoring complete:', scoreData);

      toast({
        title: "Assessment Complete!",
        description: "Your results are ready!",
      });

      navigate(`/results/${testId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit test",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection without auto-advance
  const handleAnswerSelection = (questionKey: string, value: string, questionType?: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const advanceToNextQuestion = async () => {
    const currentDimensionItems = dimensions[currentDimension]?.items || [];
    
    if (currentQuestion < currentDimensionItems.length - 1) {
      // Move to next question in current dimension
      setCurrentQuestion(prev => prev + 1);
    } else if (currentDimension < dimensions.length - 1) {
      // Move to next dimension
      setCurrentDimension(prev => prev + 1);
      setCurrentQuestion(0);
      
      toast({
        title: `${dimensions[currentDimension + 1]?.dimensionName || 'Next Dimension'}`,
        description: `Starting dimension ${currentDimension + 2} of ${dimensions.length}`,
      });
    }
    
    // Auto-save progress
    if (testId) {
      try {
        await supabase
          .from("tests")
          .update({
            current_dimension: currentDimension < dimensions.length - 1 && currentQuestion === currentDimensionItems.length - 1 
              ? currentDimension + 1 
              : currentDimension,
            current_item: currentQuestion < currentDimensionItems.length - 1 
              ? currentQuestion + 1 
              : 0,
            answers: answers,
            time_remaining: timeRemaining
          })
          .eq("id", testId);
      } catch (error) {
        console.error("Failed to auto-save progress:", error);
      }
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (currentDimension > 0) {
      const prevDimensionItems = dimensions[currentDimension - 1]?.items || [];
      setCurrentDimension(prev => prev - 1);
      setCurrentQuestion(prevDimensionItems.length - 1);
    }
  };

  // Rank ordering handlers
  const moveRankItem = (fromIndex: number, toIndex: number) => {
    const newOrder = [...rankOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setRankOrder(newOrder);
    
    // Save to answers
    const questionKey = `${currentDimension}-${currentQuestion}`;
    setAnswers(prev => ({
      ...prev,
      [questionKey]: newOrder.join(',')
    }));
  };

  // Matching handlers
  const handleMatchingSelection = (leftIndex: number, rightIndex: number) => {
    const newPairs = { ...matchingPairs };
    
    // Toggle: if this pair already exists, remove it; otherwise add it
    if (newPairs[leftIndex] === rightIndex) {
      delete newPairs[leftIndex];
    } else {
      newPairs[leftIndex] = rightIndex;
    }
    
    setMatchingPairs(newPairs);
    
    // Save to answers as "leftIndex:rightIndex,leftIndex:rightIndex,..."
    const questionKey = `${currentDimension}-${currentQuestion}`;
    const pairsString = Object.entries(newPairs)
      .map(([left, right]) => `${left}:${right}`)
      .join(',');
    
    setAnswers(prev => ({
      ...prev,
      [questionKey]: pairsString
    }));
  };

  const actualTotalQuestions = dimensions?.reduce((sum, dim) => sum + (dim.items?.length ?? 0), 0) ?? 0;
  const globalQuestionNumber = (dimensions?.slice(0, currentDimension).reduce((sum, dim) => sum + (dim.items?.length ?? 0), 0) ?? 0) + currentQuestion + 1;
  const progress = actualTotalQuestions > 0 ? (globalQuestionNumber / actualTotalQuestions) * 100 : 0;
  const isLastQuestion = currentDimension === dimensions.length - 1 && currentQuestion === (dimensions[currentDimension]?.items?.length ?? 0) - 1;

  // Show auth checking state first
  if (isAuthChecking) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={false} />
        <div className="container py-12 text-center space-y-4">
          <div className="animate-pulse">
            <Shield className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (testTerminated) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-950">
        <Navigation isAuthenticated={true} />
        <div className="container py-12 text-center space-y-4 max-w-2xl">
          <AlertCircle className="h-16 w-16 mx-auto text-red-600" />
          <h1 className="text-3xl font-bold text-red-600">Assessment Terminated</h1>
          <p className="text-lg">Multiple security violations were detected. Your assessment has been terminated and reported.</p>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="container py-12 text-center space-y-4">
          <div className="animate-pulse">
            <Brain className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }
  
  // Security consent dialog
  if (showSecurityConsent) {
    return (
      <>
        <Navigation isAuthenticated={true} />
        <SecurityConsentDialog
          open={showSecurityConsent}
          onAccept={handleSecurityConsentAccept}
          onDecline={handleSecurityConsentDecline}
          testVersion={version}
        />
      </>
    );
  }

  // Only show error if we've finished loading and still have no dimensions
  if (dimensions.length === 0 && !loading && !showConsent && !showDemographics && !showSecurityConsent) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="container py-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-bold">Failed to Load Assessment</h2>
          <p className="text-muted-foreground">
            {loadError || "Could not load test questions. Please try again."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => {
              setLoading(true);
              loadTestData();
            }}>
              Try Again
            </Button>
            <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (showConsent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Navigation isAuthenticated={true} />
        
        <main className="container py-8 sm:py-12 max-w-3xl px-3 sm:px-4">
          <Card className="test-card">
            <CardHeader className="test-section-header">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <div>
                  <h1 className="font-serif text-lg sm:text-xl font-bold">Assessment Agreement</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Please review and accept the terms before proceeding
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              {/* Assessment Details Summary Card */}
              <div className="bg-muted/50 rounded-lg p-4 sm:p-6 border-2">
                <h3 className="font-serif font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-center">Assessment Details</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">{totalQuestions}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Questions</p>
                  </div>
                  <div className="border-x">
                    <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">{Math.floor(testDuration / 60)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Minutes</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">8</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Dimensions</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t text-center">
                  <p className="text-sm sm:text-base font-semibold">
                    {assessmentInfo?.name || (version === 'beginner' ? 'Beginner Assessment' : 'Advanced Assessment')}
                  </p>
                </div>
              </div>

          {/* Consent Content */}
          <Card className="mb-6 shadow-sm border">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-5">
                {/* Purpose */}
                <div>
                  <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Purpose of Assessment
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This assessment measures your Artificial Intelligence Quotient (AIQ) - your ability to effectively 
                    collaborate with AI systems. The results will help you understand your strengths and areas for 
                    improvement across 8 critical dimensions of human-AI collaboration.
                  </p>
                </div>

                {/* Data Collection */}
                <div>
                  <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Data Collection & Usage
                  </h3>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                    <p>We collect the following data during your assessment:</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li>Your responses to assessment questions</li>
                      <li>Time taken per question and dimension</li>
                      <li>Overall performance scores and dimension breakdowns</li>
                      <li>Basic profile information (region, if provided)</li>
                    </ul>
                    <p className="pt-2">
                      Your data is encrypted, stored securely, and used solely for generating your AIQ report. 
                      You can export or delete your data at any time from your dashboard (GDPR compliance).
                    </p>
                  </div>
                </div>

                {/* Research Participation */}
                <div>
                  <h3 className="text-base font-bold mb-2">Research Participation (Optional)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your anonymized assessment data may be used for ongoing research to improve the AIQ framework 
                    and advance understanding of human-AI collaboration. This is entirely optional and does not 
                    affect your ability to take the assessment or receive results.
                  </p>
                </div>

                {/* Rights */}
                <div>
                  <h3 className="text-base font-bold mb-2">Your Rights</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Withdraw from the assessment at any time</li>
                    <li>• Pause and resume within the time limit</li>
                    <li>• Access, export, or delete your data</li>
                    <li>• Choose not to participate in research</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

              
              {/* Consent Checkboxes with Professional Layout */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id="data-collection"
                    checked={consentData.dataCollection}
                    onCheckedChange={(checked) => 
                      setConsentData(prev => ({ ...prev, dataCollection: !!checked }))
                    }
                    className="mt-1 flex-shrink-0"
                  />
                  <Label htmlFor="data-collection" className="text-xs sm:text-sm leading-relaxed cursor-pointer flex-1">
                    I consent to the collection and processing of my assessment data for scoring, 
                    certification, and research purposes. My data will be stored securely and used 
                    in accordance with privacy regulations.
                  </Label>
                </div>
                
                {!isAdolescent && (
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id="age-confirm"
                      checked={consentData.ageConfirmation}
                      onCheckedChange={(checked) =>
                        setConsentData(prev => ({ ...prev, ageConfirmation: !!checked }))
                      }
                      className="mt-1 flex-shrink-0"
                    />
                    <Label htmlFor="age-confirm" className="text-xs sm:text-sm leading-relaxed cursor-pointer flex-1">
                      I confirm that I am 18 years of age or older and am voluntarily participating 
                      in this assessment.
                    </Label>
                  </div>
                )}
                
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id="research-participation"
                    checked={consentData.researchParticipation}
                    onCheckedChange={(checked) =>
                      setConsentData(prev => ({ ...prev, researchParticipation: !!checked }))
                    }
                    className="mt-1 flex-shrink-0"
                  />
                  <Label htmlFor="research-participation" className="text-xs sm:text-sm leading-relaxed cursor-pointer flex-1">
                    I agree to participate in research studies (optional). My anonymized results may 
                    be used for academic research and product improvement.
                  </Label>
                </div>
              </div>
              
              {/* Professional CTA */}
              <Button
                size="lg"
                className="w-full professional h-11 sm:h-12"
                disabled={!consentData.dataCollection || (!isAdolescent && !consentData.ageConfirmation)}
                onClick={handleConsentSubmit}
              >
                <span className="text-sm sm:text-base">Begin Assessment</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-[10px] sm:text-xs text-center text-muted-foreground leading-relaxed">
                By clicking "Begin Assessment", you acknowledge that you have read and understood 
                the terms outlined above.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (showDemographics) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        
        <main className="container py-6 sm:py-8 max-w-4xl px-3 sm:px-4">
          {/* Demographics Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Demographics Information</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Help us understand your background (used for research purposes only)
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-semibold">Consent</span>
            </div>
            <div className="w-12 h-0.5 bg-green-600" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-semibold">Demographics</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm text-muted-foreground">Assessment</span>
            </div>
          </div>

          {/* Demographics Form */}
          <Card className="mb-6 shadow-sm border">
            <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6 px-3 sm:px-6">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                {/* Age Range */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-bold">
                    Age Range <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={demographicsData.age}
                    onValueChange={(value) => 
                      setDemographicsData(prev => ({ ...prev, age: value }))
                    }
                  >
                    <SelectTrigger id="age">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdolescent ? (
                        <>
                          <SelectItem value="14-15">14-15 years</SelectItem>
                          <SelectItem value="16-17">16-17 years</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="18-24">18-24</SelectItem>
                          <SelectItem value="25-34">25-34</SelectItem>
                          <SelectItem value="35-44">35-44</SelectItem>
                          <SelectItem value="45-54">45-54</SelectItem>
                          <SelectItem value="55-64">55-64</SelectItem>
                          <SelectItem value="65+">65+</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-bold">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={demographicsData.gender}
                    onValueChange={(value) => 
                      setDemographicsData(prev => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Education Level */}
                <div className="space-y-2">
                  <Label htmlFor="education" className="text-sm font-bold">
                    Education Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={demographicsData.education}
                    onValueChange={(value) => 
                      setDemographicsData(prev => ({ ...prev, education: value }))
                    }
                  >
                    <SelectTrigger id="education">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdolescent ? (
                        <>
                          <SelectItem value="grades-9-10">Grades 9-10 (Ages 14-15)</SelectItem>
                          <SelectItem value="grades-11-12">Grades 11-12 (Ages 16-17)</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                          <SelectItem value="masters">Master's Degree</SelectItem>
                          <SelectItem value="phd">Ph.D. or Doctorate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Experience */}
                <div className="space-y-2">
                  <Label htmlFor="aiExperience" className="text-sm font-bold">
                    AI Experience Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={demographicsData.aiExperience}
                    onValueChange={(value) => 
                      setDemographicsData(prev => ({ ...prev, aiExperience: value }))
                    }
                  >
                    <SelectTrigger id="aiExperience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No experience</SelectItem>
                      <SelectItem value="beginner">Beginner (&lt; 1 year)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Occupation - hide for adolescents */}
                {!isAdolescent && (
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-sm font-bold">
                      Current Occupation
                    </Label>
                    <Input
                      id="occupation"
                      placeholder="e.g., Software Engineer, Student, etc."
                      value={demographicsData.occupation}
                      onChange={(e) => 
                        setDemographicsData(prev => ({ ...prev, occupation: e.target.value }))
                      }
                    />
                  </div>
                )}

                {/* Industry - hide for adolescents */}
                {!isAdolescent && (
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-bold">
                      Industry/Field
                    </Label>
                    <Select
                      value={demographicsData.industry}
                      onValueChange={(value) => 
                        setDemographicsData(prev => ({ ...prev, industry: value }))
                      }
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Country */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="country" className="text-sm font-bold">
                    Country/Region
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g., United States, India, United Kingdom, etc."
                    value={demographicsData.country}
                    onChange={(e) => 
                      setDemographicsData(prev => ({ ...prev, country: e.target.value }))
                    }
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                <span className="text-destructive">*</span> Required fields. All information is kept confidential 
                and used only for research purposes to improve the AIQ framework.
              </p>
            </CardContent>
          </Card>

          {/* Why We Ask */}
          <Card className="mb-6 shadow-sm border bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-5 pb-5">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-700 dark:text-blue-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                    Why We Collect Demographics
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    This information helps researchers understand how AI collaboration skills vary across different 
                    populations, ensuring the AIQ framework remains valid and fair for all users. Your responses are 
                    anonymized and aggregated for research purposes only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={() => {
                setShowDemographics(false);
                setShowConsent(true);
              }}
              variant="outline"
              className="font-semibold h-10 sm:h-11 px-3 sm:px-4"
            >
              <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              onClick={handleDemographicsSubmit}
              disabled={!demographicsData.age || !demographicsData.gender || 
                       !demographicsData.education || !demographicsData.aiExperience}
              className="flex-1 bg-blue-900 hover:bg-blue-800 font-semibold h-10 sm:h-11 text-sm sm:text-base"
            >
              Start Assessment
              <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Main Test Interface
  const currentItem = dimensions[currentDimension]?.items?.[currentQuestion];
  const questionKey = `${currentDimension}-${currentQuestion}`;
  
  // Safety check - if no current item, show loading
  if (!currentItem) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation isAuthenticated={true} />
      
      {/* AI Blocker Component */}
      {testId && (
        <AIBlocker
          isActive={testStarted && !showConsent && !showDemographics}
          testId={testId}
          onViolation={handleSecurityViolation}
          enableFullscreen={true}
        />
      )}
      
      {/* Professional Test Header - Fixed at top */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container max-w-6xl px-3 sm:px-4">
          <div className="flex items-center justify-between py-2 sm:py-3 gap-2">
            {/* Left: Test Info */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-semibold truncate">AIQ Assessment™</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                  {assessmentInfo?.name || 'Professional Assessment'}
                </p>
              </div>
            </div>
            
            {/* Center: Progress - Desktop only */}
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm font-mono whitespace-nowrap">
                Question {globalQuestionNumber} of {actualTotalQuestions}
              </span>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Right: Timer */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted rounded-md">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-mono font-semibold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handlePauseTest} className="h-8 w-8 p-0 hidden sm:flex">
                <Pause className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Progress Bar */}
          <div className="lg:hidden pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                Question {globalQuestionNumber} of {actualTotalQuestions}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-4 sm:pt-8 pb-8 sm:pb-12">
        <div className="container max-w-4xl px-3 sm:px-4">
          {/* Dimension Badge */}
          <div className="mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-md">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">Dimension {currentDimension + 1}: {dimensions[currentDimension]?.dimensionName || dimensions[currentDimension]?.dimensionCode || 'Assessment'}</span>
            </span>
          </div>
          
          {/* Question Card */}
          <Card className="test-card">
            <CardHeader className="test-section-header">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-serif font-semibold">
                  Question {globalQuestionNumber}
                </h2>
                <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                  {globalQuestionNumber} / {actualTotalQuestions}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
            {currentItem ? (
              <div className="space-y-6">
                {(() => {
                  const { main, items } = parseQuestionText(currentItem.question);
                  
                  return (
                    <>
                      {/* Main Question */}
                      {main && (
                        <p className="text-base sm:text-lg font-semibold leading-relaxed text-foreground">
                          {main}
                        </p>
                      )}
                      
                      {/* Numbered/Lettered List Items */}
                      {items.length > 0 && (
                        <ul className="space-y-2 pl-1">
                          {items.map((item, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  );
                })()}
                
                {/* Answer Options Based on Type */}
                <div className="space-y-3">
                  {/* TRUE-FALSE */}
                  {currentItem.type === 'true-false' && (
                    <TrueFalseQuestion
                      questionKey={questionKey}
                      currentAnswer={answers[questionKey]}
                      onAnswerChange={handleAnswerSelection}
                    />
                  )}

                  {/* MULTIPLE-RESPONSE (checkboxes) */}
                  {currentItem.type === 'multiple-response' && (
                    <>
                      <p className="text-sm font-semibold text-blue-900 mb-2">SELECT ALL that apply:</p>
                      {currentItem.options?.map((option, idx) => {
                        const currentAnswers = answers[questionKey]?.split(',').filter(Boolean) || [];
                        const isChecked = currentAnswers.includes(idx.toString());
                        
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isChecked 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50 hover:bg-accent/30'
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentAnswers = answers[questionKey]?.split(',').filter(Boolean) || [];
                                let newAnswers: string[];
                                
                                if (checked) {
                                  newAnswers = [...currentAnswers, idx.toString()];
                                } else {
                                  newAnswers = currentAnswers.filter(a => a !== idx.toString());
                                }
                                
                                setAnswers(prev => ({
                                  ...prev,
                                  [questionKey]: newAnswers.join(',')
                                }));
                              }}
                              className="mt-0.5"
                            />
                            <span className="text-sm flex-1 leading-relaxed">{option}</span>
                          </label>
                        );
                      })}
                    </>
                 )}

                  {/* MULTIPLE-CHOICE / SCENARIO-BASED (single selection with auto-advance) */}
                  {(currentItem.type === 'multiple-choice' || currentItem.type === 'scenario-based') && currentItem.options && (
                    <>
                      {currentItem.options.map((option, idx) => {
                        const isSelected = answers[questionKey] === idx.toString();
                        
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50 hover:bg-accent/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${questionKey}`}
                              value={idx.toString()}
                              checked={isSelected}
                               onChange={(e) => handleAnswerSelection(
                                 questionKey,
                                 e.target.value,
                                 currentItem.type
                               )}
                              className="mt-0.5 w-4 h-4 accent-primary"
                            />
                            <span className="text-sm flex-1 leading-relaxed">{option}</span>
                          </label>
                        );
                      })}
                    </>
                  )}

                  {/* OPEN-ENDED (text area) - Not used in current assessments */}
                  {!currentItem.options && 
                   currentItem.type !== 'true-false' &&
                   currentItem.type !== 'multiple-response' && (
                    <textarea
                      className="w-full min-h-[120px] p-4 border-2 rounded-lg resize-none text-sm focus:border-primary focus:outline-none transition-colors"
                      placeholder="Type your answer here..."
                      value={answers[questionKey] || ''}
                      onChange={(e) => setAnswers(prev => ({
                        ...prev,
                        [questionKey]: e.target.value
                      }))}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading question...</p>
              </div>
            )}
            
            {/* Professional Navigation Footer */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentDimension === 0 && currentQuestion === 0}
                  size="lg"
                  className="h-10 sm:h-11 px-3 sm:px-8"
                >
                  <ChevronLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {answers[questionKey] ? (
                    <span className="flex items-center gap-1 sm:gap-2 text-success font-medium">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Answered</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 sm:gap-2">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Not answered</span>
                    </span>
                  )}
                </div>
                
                {isLastQuestion ? (
                  <Button
                    onClick={() => handleSubmitTest()}
                    disabled={Object.keys(answers).length < actualTotalQuestions}
                    size="lg"
                    className="h-10 sm:h-11 px-3 sm:px-8"
                  >
                    <span className="hidden sm:inline">Review & Submit</span>
                    <span className="sm:hidden">Submit</span>
                    <ChevronRight className="w-4 h-4 sm:ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={advanceToNextQuestion}
                    disabled={!answers[questionKey] || answers[questionKey].trim() === ''}
                    size="lg"
                    className="h-10 sm:h-11 px-3 sm:px-8"
                  >
                    <span className="hidden sm:inline">Next Question</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4 sm:ml-1" />
                  </Button>
                )}
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Test;