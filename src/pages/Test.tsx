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
import { Clock, ChevronRight } from "lucide-react";

interface TestItem {
  id: string | number;
  difficulty: string;
  question: string;
  type: string;
  options?: string[];
  correct?: string;
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

      // Accept multiple shapes: {dimensions: [...]}, [...], or { name: {items: [...]}, ... }
      let dimsRaw: any[] = [];
      if (Array.isArray(parsed)) {
        // Accept multiple shapes: {dimensions: [...]}, [...], single dimension { id/name + items: [...] }, or { name: {items: [...]}, ... }
        let dimsRaw: any[] = [];
        if (Array.isArray(parsed)) {
          dimsRaw = parsed;
        } else if (Array.isArray(parsed?.dimensions)) {
          dimsRaw = parsed.dimensions;
        } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).items)) {
          // Single-dimension object
          dimsRaw = [{ name: (parsed as any).name || (parsed as any).id || 'Dimension 1', items: (parsed as any).items }];
        } else if (parsed && typeof parsed === 'object') {
          // Object map of dimensionName -> { items: [...] } or -> [...]
          dimsRaw = Object.entries(parsed as Record<string, any>)
            .map(([name, v]) => {
              const items = Array.isArray(v?.items) ? v.items : Array.isArray(v) ? v : [];
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
          // Normalize options into { value, label }
          const options = Array.isArray(it.options)
            ? it.options.map((op: any, oi: number) => {
                if (typeof op === 'string') {
                  const val = op.includes(':') ? op.split(':')[0].trim() : String(op).trim();
                  return { value: val, label: op };
                }
                const valueRaw = (op?.value ?? op?.key ?? op?.label ?? op?.text ?? `${oi}`);
                const value = String(valueRaw);
                const labelRaw = (op?.label ?? op?.text ?? op?.value ?? op?.key ?? value);
                const label = String(labelRaw);
                return { value, label };
              })
            : undefined;

          // Normalize type
          const rawType = String(it.type || '').toLowerCase();
          let type: string = 'short';
          if (rawType.includes('multiple-choice-multiple') || (rawType.includes('multiple') && !rawType.includes('single'))) {
            type = 'multi';
          } else if (rawType.includes('multiple-choice') || Array.isArray(it.options)) {
            type = 'mcq';
          }

          // Normalize correct answer(s)
          let correct: string | undefined = undefined;
          if (it.correct !== undefined && it.correct !== null) {
            correct = String(it.correct);
          } else if (typeof it.correctAnswer === 'number' && Array.isArray(options)) {
            const opt = options[it.correctAnswer];
            if (opt) correct = String(opt.value);
          } else if (Array.isArray(it.correctAnswers) && Array.isArray(options)) {
            const vals = it.correctAnswers
              .map((idx: number) => options[idx]?.value)
              .filter(Boolean)
              .map(String)
              .sort();
            if (vals.length) correct = vals.join('||');
          }

          return {
            id: String(it.id ?? `${di}_${ii}`),
            difficulty: it.difficulty,
            question: it.question ?? '',
            type,
            options,
            correct,
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
    const isCorrect = currentQuestion.correct ? (userAnswer === currentQuestion.correct) : false;
    
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
        const correctCount = answered.filter((item: any) => answers[item.id] === item.correct).length;
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
      
      <main className="container py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {dimensions[currentDimension].name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Question {dimStates[currentDimension].answered + 1} of 10
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-elegant">
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-lg mb-6">{currentQuestion.question}</p>
              
              {currentQuestion.type === "mcq" ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) =>
                    setAnswers({ ...answers, [currentQuestion.id]: value })
                  }
                >
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option: any, index: number) => {
                      const optVal = typeof option === 'string' ? (option.includes(':') ? option.split(':')[0].trim() : option.trim()) : option.value;
                      const optLabel = typeof option === 'string' ? option : option.label;
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={optVal} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                            {optLabel}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              ) : currentQuestion.type === "multi" ? (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option: any, index: number) => {
                    const optVal = typeof option === 'string' ? (option.includes(':') ? option.split(':')[0].trim() : option.trim()) : option.value;
                    const optLabel = typeof option === 'string' ? option : option.label;
                    const selected = (answers[currentQuestion.id] || "").split("||").filter(Boolean);
                    const isChecked = selected.includes(optVal);
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`option-${index}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const next = new Set(selected);
                            if (checked === true) next.add(optVal); else next.delete(optVal);
                            const joined = Array.from(next).map(String).sort().join("||");
                            setAnswers({ ...answers, [currentQuestion.id]: joined });
                          }}
                        />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                          {optLabel}
                        </Label>
                      </div>
                    );
                  })}
                </div>
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
