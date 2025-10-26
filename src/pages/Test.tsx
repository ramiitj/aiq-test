import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ConsentForm } from "@/components/ConsentForm";
import { useToast } from "@/hooks/use-toast";
import { Clock, ChevronRight, Pause } from "lucide-react";

interface TestItem {
  id: string | number;
  difficulty: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  rubric?: string;
}

interface Dimension {
  name: string;
  items: TestItem[];
}

const Test = () => {
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [testId, setTestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [dimStates, setDimStates] = useState<Array<{ theta: number; used: Set<string>; counts: { easy: number; medium: number; hard: number }; answered: number }>>([]);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('resume');
    
    if (resumeId) {
      // Resume existing test
      resumeTest(resumeId);
    } else if (consentGiven) {
      // Start new test
      initializeTest();
    }

    if (consentGiven || resumeId) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(timer);

      return () => clearInterval(timer);
    }
  }, [consentGiven]);

  const resumeTest = async (testId: string) => {
    try {
      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (error) throw error;

      // Restore all state
      setTestId(data.id);
      setTimeRemaining(data.time_remaining || 3600);
      setCurrentDimension(data.current_dimension || 0);
      setCurrentItem(data.current_item || 0);
      setAnswers(typeof data.answers === 'string' ? JSON.parse(data.answers) : data.answers);
      
      const parsedStates = typeof data.dimension_states === 'string' 
        ? JSON.parse(data.dimension_states) 
        : data.dimension_states;
      
      const restoredStates = parsedStates.map((s: any) => ({
        theta: s.theta,
        used: new Set(s.used),
        counts: s.counts,
        answered: s.answered,
      }));
      setDimStates(restoredStates);

      // Load test items
      const { data: fileData } = await supabase.storage
        .from("aiq-items")
        .download(data.json_version);

      const text = await fileData!.text();
      const parsed = JSON.parse(text);
      const allItems = Array.isArray((parsed as any).items) ? (parsed as any).items : [];
      
      // Group and rebuild dimensions (simplified for resume)
      const grouped = new Map<string, any[]>();
      allItems.forEach((item: any) => {
        const code = String(item.id || '').split('-')[0].toUpperCase();
        if (!grouped.has(code)) grouped.set(code, []);
        grouped.get(code)!.push(item);
      });

      const sortedCodes = Array.from(grouped.entries()).sort((a, b) => b[1].length - a[1].length).slice(0, 8);
      const normalized = sortedCodes.map(([code, items]) => ({ name: code, items }));
      setDimensions(normalized);

      // Unpause
      await supabase.from("tests").update({ paused: false }).eq("id", testId);

      setConsentGiven(true);
      setShowConsent(false);
      setLoading(false);

      toast({ title: "Test Resumed", description: "Continuing from where you left off" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      navigate("/dashboard");
    }
  };

  const initializeTest = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const mapDiff = (d: any): 'easy' | 'medium' | 'hard' => {
      if (typeof d === 'number') return d <= -0.5 ? 'easy' : d >= 0.5 ? 'hard' : 'medium';
      const s = String(d || '').toLowerCase();
      if (s.includes('easy') || s === 'e' || s === '-1') return 'easy';
      if (s.includes('hard') || s === 'h' || s === '1') return 'hard';
      return 'medium';
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    try {
      // Load latest test items from Storage
      const { data: files, error: listError } = await supabase.storage
        .from("aiq-items")
        .list("", { sortBy: { column: "created_at", order: "desc" }, limit: 1 });

      if (listError) throw listError;

      if (!files || files.length === 0) {
        throw new Error("No test items found. Please contact admin.");
      }

      const latestFile = files[0].name;
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("aiq-items")
        .download(latestFile);

      if (downloadError) throw downloadError;

      const text = await fileData.text();
      const parsed = JSON.parse(text);

      // Accept multiple shapes and group by ID prefix
      let allItems: any[] = [];
      
      if (Array.isArray(parsed)) {
        // Array of dimension objects: [{ name, items }, ...]
        allItems = parsed.flatMap((d: any) => d.items || []);
      } else if (Array.isArray((parsed as any)?.dimensions)) {
        // { dimensions: [{ name, items }, ...] }
        allItems = (parsed as any).dimensions.flatMap((d: any) => d.items || []);
      } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).items)) {
        // { items: [...] }
        allItems = (parsed as any).items;
      } else if (parsed && typeof parsed === 'object') {
        // Map-like: { SAU: { items: [...] }, PEI: { items: [...] }, ... }
        allItems = Object.values(parsed as Record<string, any>).flatMap((v: any) => 
          Array.isArray((v as any)?.items) ? (v as any).items : (Array.isArray(v) ? v : [])
        );
      }

      if (!allItems.length) {
        throw new Error("Invalid test format: no items found.");
      }

      // Group items by ID prefix
      const grouped = new Map<string, any[]>();
      allItems.forEach((item: any) => {
        const id = String(item.id || '');
        const code = id.includes('-') ? id.split('-')[0].toUpperCase() : 'MISC';
        if (!grouped.has(code)) grouped.set(code, []);
        grouped.get(code)!.push(item);
      });

      // Select exactly 8 dimensions with the most items
      const sortedCodes = Array.from(grouped.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 8);

      if (sortedCodes.length < 8) {
        throw new Error(`Not enough dimensions found. Expected 8, found ${sortedCodes.length}. Please upload a complete test set.`);
      }

      // Validate each dimension has at least 10 items
      for (const [code, items] of sortedCodes) {
        if (items.length < 10) {
          throw new Error(`Dimension ${code} has only ${items.length} items. Need at least 10 items per dimension.`);
        }
      }

      // Build normalized dimensions with shuffled difficulty pools
      const normalized: Dimension[] = sortedCodes.map(([code, rawItems]) => {
        const items = rawItems.map((it: any) => {
          // Enhanced removal of "Select ALL" variations
          let cleanQuestion = String(it.question ?? '').trim();
          cleanQuestion = cleanQuestion
            .replace(/\bselect\s+all\s*(?:that\s+apply)?\s*:?\s*/gi, '')
            .replace(/^\s*:?\s*/, '')
            .trim();
          
          // Capitalize first letter if needed
          if (cleanQuestion && cleanQuestion[0] === cleanQuestion[0].toLowerCase()) {
            cleanQuestion = cleanQuestion.charAt(0).toUpperCase() + cleanQuestion.slice(1);
          }

          return {
            id: String(it.id ?? `${code}_${Math.random()}`),
            difficulty: it.difficulty ?? 'medium',
            question: cleanQuestion,
            type: it.type ?? 'multiple-choice',
            options: Array.isArray(it.options) ? it.options.map((o: any) => String(o)) : undefined,
            correctAnswer: it.correctAnswer,
            correctAnswers: it.correctAnswers,
            rubric: it.explanation ?? it.rubric,
          } as TestItem;
        });

        // Partition and shuffle by difficulty
        const easy = shuffleArray(items.filter(it => mapDiff(it.difficulty) === 'easy'));
        const medium = shuffleArray(items.filter(it => mapDiff(it.difficulty) === 'medium'));
        const hard = shuffleArray(items.filter(it => mapDiff(it.difficulty) === 'hard'));

        // Recombine shuffled pools
        const shuffledItems = [...easy, ...medium, ...hard];

        return {
          name: code,
          items: shuffledItems,
        };
      });

      setDimensions(normalized);

      // Initialize adaptive state for 8 dimensions
      const initStates = normalized.map(() => ({
        theta: 0,
        used: new Set<string>(),
        counts: { easy: 0, medium: 0, hard: 0 },
        answered: 0,
      }));
      setDimStates(initStates);

      // Start with first dimension, first medium item (or fallback)
      setCurrentDimension(0);
      const firstItems = normalized[0].items;
      const mediumIdx = firstItems.findIndex(it => mapDiff(it.difficulty) === 'medium');
      const easyIdx = firstItems.findIndex(it => mapDiff(it.difficulty) === 'easy');
      const hardIdx = firstItems.findIndex(it => mapDiff(it.difficulty) === 'hard');
      const startIdx = mediumIdx >= 0 ? mediumIdx : (easyIdx >= 0 ? easyIdx : (hardIdx >= 0 ? hardIdx : 0));
      setCurrentItem(startIdx);

      // Create test record with consent
      const { data, error } = await supabase
        .from("tests")
        .insert({
          user_id: session.user.id,
          json_version: latestFile,
          completed: false,
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setTestId(data.id);
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


  const mapDiff = (d: any): 'easy' | 'medium' | 'hard' => {
    if (typeof d === 'number') return d <= -0.5 ? 'easy' : d >= 0.5 ? 'hard' : 'medium';
    const s = String(d || '').toLowerCase();
    if (s.includes('easy') || s === 'e' || s === '-1') return 'easy';
    if (s.includes('hard') || s === 'h' || s === '1') return 'hard';
    return 'medium';
  };

  const selectNextItem = (dimIdx: number, theta: number, used: Set<string>, counts: { easy: number; medium: number; hard: number }): number => {
    const items = dimensions[dimIdx]?.items || [];
    const targetDiff = theta < -0.5 ? 'easy' : theta > 0.5 ? 'hard' : 'medium';
    
    // Build pools by difficulty
    const poolsByDiff = {
      easy: items.map((it, idx) => ({ it, idx })).filter(({ it }) => !used.has(String(it.id)) && mapDiff(it.difficulty) === 'easy'),
      medium: items.map((it, idx) => ({ it, idx })).filter(({ it }) => !used.has(String(it.id)) && mapDiff(it.difficulty) === 'medium'),
      hard: items.map((it, idx) => ({ it, idx })).filter(({ it }) => !used.has(String(it.id)) && mapDiff(it.difficulty) === 'hard'),
    };

    // Try target difficulty first
    if (poolsByDiff[targetDiff].length > 0) {
      return poolsByDiff[targetDiff][0].idx;
    }

    // Fallback: try nearest difficulty
    const fallbackOrder: Array<'easy' | 'medium' | 'hard'> = 
      targetDiff === 'easy' ? ['medium', 'hard'] :
      targetDiff === 'hard' ? ['medium', 'easy'] :
      ['easy', 'hard'];

    for (const diff of fallbackOrder) {
      if (poolsByDiff[diff].length > 0) {
        return poolsByDiff[diff][0].idx;
      }
    }

    // Should not happen if we have enough items, but return -1 if exhausted
    return -1;
  };

  const handlePause = async () => {
    if (!testId) return;

    try {
      // Stop the timer
      if (timerInterval) {
        clearInterval(timerInterval);
      }

      // Save current state to database
      const { error } = await supabase
        .from("tests")
        .update({
          paused: true,
          pause_timestamp: new Date().toISOString(),
          time_remaining: timeRemaining,
          current_dimension: currentDimension,
          current_item: currentItem,
          dimension_states: JSON.stringify(dimStates.map(s => ({
            theta: s.theta,
            used: Array.from(s.used),
            counts: s.counts,
            answered: s.answered,
          }))),
          answers: JSON.stringify(answers),
        })
        .eq("id", testId);

      if (error) throw error;

      toast({
        title: "Test Paused",
        description: "You can resume anytime from your dashboard",
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

  const handleNext = async () => {
    const currentQuestion = dimensions[currentDimension]?.items[currentItem];
    
    if (!currentQuestion || !answers[currentQuestion.id]) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const state = dimStates[currentDimension];
    const userAnswer = answers[currentQuestion.id];
    
    // Check correctness based on answer format
    let isCorrect = false;
    if (typeof currentQuestion.correctAnswer === 'number' && currentQuestion.options) {
      isCorrect = userAnswer === String(currentQuestion.correctAnswer);
    } else if (Array.isArray(currentQuestion.correctAnswers)) {
      const userIndices = userAnswer.split(',').map(s => parseInt(s.trim())).sort();
      const correctIndices = [...currentQuestion.correctAnswers].sort();
      isCorrect = JSON.stringify(userIndices) === JSON.stringify(correctIndices);
    }
    
    // Update theta (simple IRT-like)
    const delta = isCorrect ? 0.3 : -0.3;
    const newTheta = Math.max(-2, Math.min(2, state.theta + delta));
    const newUsed = new Set(state.used).add(String(currentQuestion.id));
    const diff = mapDiff(currentQuestion.difficulty);
    const newCounts = { ...state.counts, [diff]: state.counts[diff] + 1 };
    const newAnswered = state.answered + 1;

    const updatedStates = [...dimStates];
    updatedStates[currentDimension] = { theta: newTheta, used: newUsed, counts: newCounts, answered: newAnswered };
    setDimStates(updatedStates);

    // Check if dimension complete (exactly 10 items answered)
    if (newAnswered >= 10) {
      if (currentDimension < 5) {
        // Move to next dimension (we have exactly 6 dimensions, 0-5)
        const nextDim = currentDimension + 1;
        setCurrentDimension(nextDim);
        const nextIdx = selectNextItem(nextDim, updatedStates[nextDim].theta, updatedStates[nextDim].used, updatedStates[nextDim].counts);
        if (nextIdx < 0) {
          toast({ 
            title: "Error", 
            description: `Dimension ${nextDim + 1} has insufficient items.`,
            variant: "destructive"
          });
          await handleSubmit();
        } else {
          setCurrentItem(nextIdx);
        }
      } else {
        // Completed all 6 dimensions (60 questions total)
        await handleSubmit();
      }
    } else {
      // Continue in current dimension
      const nextIdx = selectNextItem(currentDimension, newTheta, newUsed, newCounts);
      if (nextIdx < 0) {
        // Ran out of items before reaching 10 - should not happen with validation
        toast({ 
          title: "Error", 
          description: "Insufficient items in current dimension.",
          variant: "destructive"
        });
        await handleSubmit();
      } else {
        setCurrentItem(nextIdx);
      }
    }

    // Auto-save progress every 3 questions
    if (newAnswered % 3 === 0 && testId) {
      await supabase
        .from("tests")
        .update({ answers: JSON.stringify(answers) })
        .eq("id", testId);
    }
  };

  const handleSubmit = async () => {
    if (!testId) return;

    try {
      const scores = dimensions.map((dim, di) => {
        const state = dimStates[di];
        const answered = Array.from(state.used).map(id => dim.items.find(it => String(it.id) === id)).filter(Boolean);
        const correctCount = answered.filter((item: any) => {
          const userAnswer = answers[item.id];
          if (typeof item.correctAnswer === 'number') {
            return userAnswer === String(item.correctAnswer);
          } else if (Array.isArray(item.correctAnswers)) {
            const userIndices = userAnswer.split(',').map((s: string) => parseInt(s.trim())).sort();
            const correctIndices = [...item.correctAnswers].sort();
            return JSON.stringify(userIndices) === JSON.stringify(correctIndices);
          }
          return false;
        }).length;
        return answered.length > 0 ? (correctCount / answered.length) * 100 : 0;
      });

      const { error } = await supabase
        .from("tests")
        .update({
          answers: JSON.stringify(answers),
          scores: JSON.stringify(scores),
          completed: true,
          end_time: new Date().toISOString(),
        })
        .eq("id", testId);

      if (error) throw error;

      toast({
        title: "Test Submitted!",
        description: "Your AIQ test has been completed successfully.",
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

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowConsent(false);
  };

  const handleConsentDecline = () => {
    toast({
      title: "Consent Required",
      description: "You must consent to participate in the research assessment",
      variant: "destructive",
    });
    navigate("/dashboard");
  };

  if (showConsent && !consentGiven) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <ConsentForm
          open={showConsent}
          onConsent={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      </div>
    );
  }

  if (loading || dimensions.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="container py-8">
          <div className="text-center">Initializing test...</div>
        </div>
      </div>
    );
  }

  const currentQuestion = dimensions[currentDimension]?.items[currentItem];
  const totalAnswered = dimStates.reduce((sum, s) => sum + s.answered, 0);
  const totalRequired = 80; // Fixed: 8 dimensions × 10 items each
  const progress = (totalAnswered / totalRequired) * 100;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="container py-8">
          <div className="text-center">Error loading question</div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} />
      
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Section {currentDimension + 1} of 8
              </h2>
              <p className="text-base text-muted-foreground mt-1 font-medium">
                Question {dimStates[currentDimension].answered + 1} of 10
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-6 w-6" />
                <span className="font-mono text-xl font-semibold tabular-nums">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="shadow-elegant">
          <CardContent className="pt-8 pb-8 space-y-8">
            <div>
              <p className="text-xl lg:text-2xl font-semibold mb-8 leading-relaxed">{currentQuestion.question}</p>
              
              {currentQuestion.type === "multiple-choice-multiple" ? (
                <div className="space-y-4">
                  {currentQuestion.options?.map((option: string, index: number) => {
                    const selectedIndices = (answers[currentQuestion.id] || "").split(",").filter(Boolean).map(s => parseInt(s.trim()));
                    const isChecked = selectedIndices.includes(index);
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <Checkbox
                          id={`option-${index}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const current = selectedIndices.filter((i: number) => i !== index);
                            if (checked) current.push(index);
                            setAnswers({
                              ...answers,
                              [currentQuestion.id]: current.sort((a: number, b: number) => a - b).join(","),
                            });
                          }}
                        />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 text-lg font-medium leading-relaxed">
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              ) : currentQuestion.options ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) =>
                    setAnswers({ ...answers, [currentQuestion.id]: value })
                  }
                >
                  <div className="space-y-4">
                    {currentQuestion.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <RadioGroupItem value={String(index)} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 text-lg font-medium leading-relaxed">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [currentQuestion.id]: e.target.value })
                  }
                  className="min-h-[200px]"
                />
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext}>
                {totalAnswered >= 79 ? "Submit Test" : "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Test;
