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
import { useToast } from "@/hooks/use-toast";
import { Timer, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    initializeTest();
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

      // Accept multiple shapes: array, {dimensions: [...]}, single dimension with items to split by prefix, or object map
      let dimsRaw: any[] = [];
      if (Array.isArray(parsed)) {
        dimsRaw = parsed;
      } else if (Array.isArray((parsed as any)?.dimensions)) {
        dimsRaw = (parsed as any).dimensions;
      } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).items)) {
        // Single dimension with mixed items - split by ID prefix
        const allItems = (parsed as any).items;
        const grouped = new Map<string, any[]>();
        
        allItems.forEach((item: any) => {
          const id = String(item.id || '');
          const prefix = id.includes('-') ? id.split('-')[0] : 'MISC';
          if (!grouped.has(prefix)) grouped.set(prefix, []);
          grouped.get(prefix)!.push(item);
        });

        const dimensionNames: Record<string, string> = {
          'ALC': 'Adaptive Learning & Continuous Improvement',
          'CEC': 'Critical Evaluation & Calibration',
          'EJU': 'Ethical Judgment & Use',
          'ITI': 'Integration & Transformation Intelligence',
          'CLM': 'Cognitive Load Management',
          'KOI': 'Knowledge Organization & Insight'
        };

        dimsRaw = Array.from(grouped.entries()).map(([prefix, items]) => ({
          name: dimensionNames[prefix] || prefix,
          items
        }));
      } else if (parsed && typeof parsed === 'object') {
        dimsRaw = Object.entries(parsed as Record<string, any>)
          .map(([name, v]) => {
            const items = Array.isArray((v as any)?.items) ? (v as any).items : Array.isArray(v) ? (v as any) : [];
            return { name, items };
          })
          .filter((d) => Array.isArray(d.items) && d.items.length > 0);
      }

      if (!dimsRaw.length) {
        throw new Error("Invalid test format: expected dimensions with items.");
      }

      const normalized: Dimension[] = dimsRaw.map((d: any, di: number) => ({
        name: d.name || `Dimension ${di + 1}`,
        items: (d.items || []).map((it: any, ii: number) => {
          // Clean question text: Enhanced removal of "Select ALL" variations
          let cleanQuestion = String(it.question ?? '').trim();
          cleanQuestion = cleanQuestion
            .replace(/\bselect\s+all\s*(?:that\s+apply)?\s*:?\s*/gi, '')
            .replace(/^\s*:?\s*/, '')
            .trim();

          return {
            id: String(it.id ?? `${di}_${ii}`),
            difficulty: it.difficulty,
            question: cleanQuestion,
            type: it.type,
            options: Array.isArray(it.options) ? it.options.map((o: any) => String(o)) : undefined,
            correctAnswer: it.correctAnswer,
            correctAnswers: it.correctAnswers,
            rubric: it.explanation ?? it.rubric,
          } as TestItem;
        }),
      }));

      setDimensions(normalized);

      // Initialize adaptive state
      const initStates = normalized.map(() => ({
        theta: 0,
        used: new Set<string>(),
        counts: { easy: 0, medium: 0, hard: 0 },
        answered: 0,
      }));
      setDimStates(initStates);

      // Choose first dimension with items and first question (prefer medium)
      const firstDimIdx = normalized.findIndex((d: any) => Array.isArray(d.items) && d.items.length > 0);
      if (firstDimIdx === -1) {
        throw new Error('No items found in any dimension.');
      }
      setCurrentDimension(firstDimIdx);
      const firstItems = normalized[firstDimIdx].items || [];
      const findIdx = (target: 'easy' | 'medium' | 'hard') => firstItems.findIndex((it: any) => mapDiff(it.difficulty) === target);
      const firstIdx = (findIdx('medium') !== -1 ? findIdx('medium') : (findIdx('easy') !== -1 ? findIdx('easy') : findIdx('hard')));
      setCurrentItem(firstIdx >= 0 ? firstIdx : 0);

      // Create test record
      const { data, error } = await supabase
        .from("tests")
        .insert({
          user_id: session.user.id,
          json_version: latestFile,
          completed: false,
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
    const pool = items.map((it, idx) => ({ it, idx, diff: mapDiff(it.difficulty) })).filter(({ it, diff }) => !used.has(String(it.id)) && diff === targetDiff);
    if (pool.length) return pool[0].idx;
    
    const fallback = items.map((it, idx) => ({ it, idx })).filter(({ it }) => !used.has(String(it.id)));
    return fallback.length ? fallback[0].idx : -1;
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

    // Check if dimension complete (10 items answered)
    if (newAnswered >= 10) {
      if (currentDimension < dimensions.length - 1) {
        const nextDim = currentDimension + 1;
        setCurrentDimension(nextDim);
        const nextIdx = selectNextItem(nextDim, updatedStates[nextDim].theta, updatedStates[nextDim].used, updatedStates[nextDim].counts);
        setCurrentItem(nextIdx >= 0 ? nextIdx : 0);
      } else {
        await handleSubmit();
      }
    } else {
      const nextIdx = selectNextItem(currentDimension, newTheta, newUsed, newCounts);
      if (nextIdx >= 0) {
        setCurrentItem(nextIdx);
      } else {
        toast({ title: "No more items", description: "Moving to next dimension.", variant: "default" });
        if (currentDimension < dimensions.length - 1) {
          const nextDim = currentDimension + 1;
          setCurrentDimension(nextDim);
          const nextIdx2 = selectNextItem(nextDim, updatedStates[nextDim].theta, updatedStates[nextDim].used, updatedStates[nextDim].counts);
          setCurrentItem(nextIdx2 >= 0 ? nextIdx2 : 0);
        } else {
          await handleSubmit();
        }
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
  const totalRequired = dimensions.length * 10;
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
      
      {/* Fixed progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>
      
      <main className="container py-8 max-w-4xl mt-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">
                Section {currentDimension + 1} of {dimensions.length}
              </h2>
              <p className="text-lg text-muted-foreground mt-1">
                Question {dimStates[currentDimension].answered + 1} of 10
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-accent/50 border">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-mono text-xl font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>

        <Card className="shadow-premium hover-lift border-2">
          <CardContent className="pt-8 space-y-8">
            <div>
              <p className="text-2xl font-bold mb-8 leading-relaxed">{currentQuestion.question}</p>
              
              {currentQuestion.type === "multiple-choice-multiple" ? (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option: string, index: number) => {
                    const selectedIndices = (answers[currentQuestion.id] || "").split(",").filter(Boolean).map(s => parseInt(s.trim()));
                    const isChecked = selectedIndices.includes(index);
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50",
                          isChecked && "border-primary bg-accent"
                        )}
                        onClick={() => {
                          const current = selectedIndices.filter((i: number) => i !== index);
                          if (!isChecked) current.push(index);
                          setAnswers({
                            ...answers,
                            [currentQuestion.id]: current.sort((a: number, b: number) => a - b).join(","),
                          });
                        }}
                      >
                        <Checkbox
                          id={`option-${index}`}
                          checked={isChecked}
                          className="mt-0.5"
                        />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 font-medium leading-relaxed">
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
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: string, index: number) => {
                      const isSelected = answers[currentQuestion.id] === String(index);
                      return (
                        <div 
                          key={index} 
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50",
                            isSelected && "border-primary bg-accent"
                          )}
                        >
                          <RadioGroupItem value={String(index)} id={`option-${index}`} className="mt-0.5" />
                          <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 font-medium leading-relaxed">
                            {option}
                          </Label>
                        </div>
                      );
                    })}
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
                {totalAnswered >= totalRequired - 1 ? "Submit Test" : "Next"}
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
