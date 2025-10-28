import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Pause,
  Shield,
  FileText,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConsentData {
  dataCollection: boolean;
  researchParticipation: boolean;
  ageConfirmation: boolean;
}

const Test = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState<string | null>(null);
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConsent, setShowConsent] = useState(true);
  const [consentData, setConsentData] = useState<ConsentData>({
    dataCollection: false,
    researchParticipation: false,
    ageConfirmation: false
  });

  const version = searchParams.get('version') || 'professional';
  const resumeId = searchParams.get('resume');

  const dimensions = [
    "Strategic AI Understanding",
    "Prompt Engineering Intelligence",
    "Critical Evaluation Capability",
    "Integration Intelligence",
    "Adaptive Learning Capability",
    "Ethical Judgment in AI Utilization",
    "Context Sensitivity",
    "Creative Synthesis"
  ];

  const questionsPerDimension = version === 'beginner' ? 3 : 10;
  const totalQuestions = version === 'beginner' ? 24 : 80;
  const testDuration = version === 'beginner' ? 900 : 3600; // 15 or 60 minutes

  useEffect(() => {
    initializeTest();
  }, []);

  useEffect(() => {
    if (!showConsent && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showConsent, timeRemaining]);

  const initializeTest = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      if (resumeId) {
        // Resume existing test
        const { data: testData, error } = await supabase
          .from("tests")
          .select("*")
          .eq("id", resumeId)
          .single();

        if (error) throw error;

        setTestId(testData.id);
        setCurrentDimension(testData.current_dimension || 0);
        setCurrentQuestion(testData.current_question || 0);
        setTimeRemaining(testData.time_remaining || testDuration);
        setAnswers(testData.responses || {});
        setShowConsent(false);
      } else {
        // New test - show consent
        setTimeRemaining(testDuration);
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

  const handleConsentSubmit = async () => {
    if (!consentData.dataCollection || !consentData.ageConfirmation) {
      toast({
        title: "Consent Required",
        description: "Please accept the required terms to continue",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data: newTest, error } = await supabase
        .from("tests")
        .insert({
          user_id: session.user.id,
          version: version,
          consent_given: true,
          research_consent: consentData.researchParticipation,
          time_remaining: testDuration,
          current_dimension: 0,
          current_question: 0,
          responses: {}
        })
        .select()
        .single();

      if (error) throw error;

      setTestId(newTest.id);
      setShowConsent(false);
      
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
          current_question: currentQuestion,
          responses: answers
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

  const handleSubmitTest = async () => {
    if (!testId) return;

    try {
      await supabase
        .from("tests")
        .update({
          completed: true,
          responses: answers,
          time_remaining: timeRemaining
        })
        .eq("id", testId);

      toast({
        title: "Assessment Complete!",
        description: "Calculating your AIQ scores...",
      });

      navigate(`/results/${testId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentDimension * questionsPerDimension + currentQuestion) / totalQuestions) * 100;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (showConsent) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        
        <main className="container py-8 max-w-4xl">
          {/* Consent Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Informed Consent</h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Please review and accept before starting your assessment
                </p>
              </div>
            </div>
          </div>

          {/* Test Info Card */}
          <Card className="mb-6 shadow-sm border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black mb-1">
                    {version === 'beginner' ? 'Foundational' : version === 'professional' ? 'Comprehensive' : 'Advanced'} Assessment
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {totalQuestions} questions • {version === 'beginner' ? '15' : '60'} minutes • 8 dimensions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-900 dark:text-blue-100">
                    {formatTime(testDuration)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Consent Checkboxes */}
          <Card className="mb-6 shadow-sm border">
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="dataCollection"
                    checked={consentData.dataCollection}
                    onCheckedChange={(checked) => 
                      setConsentData(prev => ({ ...prev, dataCollection: checked as boolean }))
                    }
                    className="mt-0.5"
                  />
                  <label htmlFor="dataCollection" className="text-sm leading-relaxed cursor-pointer">
                    <span className="font-bold">I consent to data collection</span> for the purpose of generating 
                    my AIQ assessment results. I understand my data will be stored securely and I can export or 
                    delete it at any time. <span className="text-destructive">*</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="researchParticipation"
                    checked={consentData.researchParticipation}
                    onCheckedChange={(checked) => 
                      setConsentData(prev => ({ ...prev, researchParticipation: checked as boolean }))
                    }
                    className="mt-0.5"
                  />
                  <label htmlFor="researchParticipation" className="text-sm leading-relaxed cursor-pointer">
                    <span className="font-bold">I consent to anonymized research participation</span> to help 
                    improve the AIQ framework and advance human-AI collaboration research. (Optional)
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ageConfirmation"
                    checked={consentData.ageConfirmation}
                    onCheckedChange={(checked) => 
                      setConsentData(prev => ({ ...prev, ageConfirmation: checked as boolean }))
                    }
                    className="mt-0.5"
                  />
                  <label htmlFor="ageConfirmation" className="text-sm leading-relaxed cursor-pointer">
                    <span className="font-bold">I confirm that I am 18 years of age or older.</span> 
                    <span className="text-destructive"> *</span>
                  </label>
                </div>

                <p className="text-xs text-muted-foreground pt-2">
                  <span className="text-destructive">*</span> Required to proceed with assessment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="flex-1 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConsentSubmit}
              disabled={!consentData.dataCollection || !consentData.ageConfirmation}
              className="flex-1 bg-blue-900 hover:bg-blue-800 font-semibold"
            >
              Accept & Start Assessment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            By proceeding, you acknowledge that you have read and understood the consent information above.
            For questions, contact: ram@iitj.ac.in
          </p>
        </main>
      </div>
    );
  }

  // Main Test Interface
  return (
    <div className="min-h-screen">
      <Navigation isAuthenticated={true} />
      
      {/* Test Header */}
      <div className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="container py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold tabular-nums">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentDimension * questionsPerDimension + currentQuestion + 1} of {totalQuestions}
              </span>
            </div>
            <Button
              onClick={handlePauseTest}
              variant="outline"
              size="sm"
              className="font-semibold"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <main className="container py-6 max-w-4xl">
        {/* Current Dimension */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-2">
            <span className="text-xs font-bold text-primary">
              Dimension {currentDimension + 1}/8
            </span>
          </div>
          <h2 className="text-2xl font-black mb-1">{dimensions[currentDimension]}</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questionsPerDimension}
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-6 shadow-sm border">
          <CardContent className="pt-6 pb-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed mb-6">
                [Question content would be dynamically loaded here based on currentDimension and currentQuestion]
                This is a placeholder for the actual question. In the real implementation, questions would be 
                loaded from your database based on the current dimension and question index.
              </p>
              
              {/* Answer Options or Text Area */}
              <div className="space-y-3">
                <textarea
                  className="w-full min-h-[120px] p-4 border rounded-lg resize-none text-sm"
                  placeholder="Type your answer here..."
                  value={answers[`${currentDimension}-${currentQuestion}`] || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    [`${currentDimension}-${currentQuestion}`]: e.target.value
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(prev => prev - 1);
              } else if (currentDimension > 0) {
                setCurrentDimension(prev => prev - 1);
                setCurrentQuestion(questionsPerDimension - 1);
              }
            }}
            disabled={currentDimension === 0 && currentQuestion === 0}
            variant="outline"
            className="font-semibold"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentDimension === dimensions.length - 1 && currentQuestion === questionsPerDimension - 1 ? (
            <Button
              onClick={handleSubmitTest}
              className="flex-1 bg-green-600 hover:bg-green-700 font-semibold"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Assessment
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (currentQuestion < questionsPerDimension - 1) {
                  setCurrentQuestion(prev => prev + 1);
                } else if (currentDimension < dimensions.length - 1) {
                  setCurrentDimension(prev => prev + 1);
                  setCurrentQuestion(0);
                }
              }}
              className="flex-1 bg-blue-900 hover:bg-blue-800 font-semibold"
            >
              Next Question
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Helper Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-700 dark:text-blue-300 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">Assessment Tips:</p>
              <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Take your time to read each question carefully</li>
                <li>• There are no right or wrong answers - be honest</li>
                <li>• You can navigate back to review previous questions</li>
                <li>• Your progress is automatically saved</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Test;