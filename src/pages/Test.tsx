import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
        dimsRaw = parsed;
      } else if (Array.isArray(parsed?.dimensions)) {
        dimsRaw = parsed.dimensions;
      } else if (parsed && typeof parsed === 'object') {
        dimsRaw = Object.keys(parsed).map((name) => {
          const v = (parsed as any)[name];
          const items = Array.isArray(v?.items) ? v.items : Array.isArray(v) ? v : [];
          return { name, items };
        });
      }

      if (!dimsRaw.length) {
        throw new Error("Invalid test format: expected a 'dimensions' array or an array of dimensions.");
      }

      const normalized: Dimension[] = dimsRaw.map((d: any, di: number) => ({
        name: d.name || `Dimension ${di + 1}`,
        items: (d.items || []).map((it: any, ii: number) => ({
          id: String(it.id ?? `${di}_${ii}`),
          difficulty: it.difficulty,
          question: it.question ?? '',
          type: it.type ?? (Array.isArray(it.options) ? 'mcq' : 'short'),
          options: Array.isArray(it.options)
            ? it.options.map((op: any) => {
                if (typeof op === 'string') {
                  const val = op.includes(':') ? op.split(':')[0].trim() : String(op).trim();
                  return { value: val, label: op } as any;
                }
                const valueRaw = op?.value ?? op?.key ?? (op?.label ?? op?.text);
                const value = String(valueRaw != null && valueRaw !== '' ? valueRaw : `${ii}`);
                const labelRaw = op?.label ?? op?.text ?? op?.value ?? op?.key;
                const label = String(labelRaw != null ? labelRaw : '');
                return { value, label } as any;
              })
            : undefined,
          correct: it.correct,
          rubric: it.rubric,
        })),
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

      // Choose first question for first dimension (prefer medium)
      const firstItems = normalized[0]?.items || [];
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

    if (currentItem < dimensions[currentDimension].items.length - 1) {
      setCurrentItem(currentItem + 1);
    } else if (currentDimension < dimensions.length - 1) {
      setCurrentDimension(currentDimension + 1);
      setCurrentItem(0);
    } else {
      await handleSubmit();
    }

    // Auto-save progress every 5 questions
    if ((currentItem + 1) % 5 === 0 && testId) {
      await supabase
        .from("tests")
        .update({ answers: JSON.stringify(answers) })
        .eq("id", testId);
    }
  };

  const handleSubmit = async () => {
    if (!testId) return;

    try {
      // Calculate scores (simplified - in production, use proper rubrics)
      const scores = dimensions.map((dim) => {
        const dimAnswers = dim.items.filter((item) => answers[item.id]);
        const correctCount = dimAnswers.filter((item) => answers[item.id] === item.correct).length;
        return (correctCount / dim.items.length) * 100;
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
  const totalItems = dimensions.reduce((sum, dim) => sum + dim.items.length, 0);
  const completedItems = dimensions.slice(0, currentDimension).reduce((sum, dim) => sum + dim.items.length, 0) + currentItem;
  const progress = (completedItems / totalItems) * 100;

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
                Question {currentItem + 1} of {dimensions[currentDimension].items.length}
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
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.split(":")[0]} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
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

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentItem > 0) {
                    setCurrentItem(currentItem - 1);
                  } else if (currentDimension > 0) {
                    setCurrentDimension(currentDimension - 1);
                    setCurrentItem(dimensions[currentDimension - 1].items.length - 1);
                  }
                }}
                disabled={currentDimension === 0 && currentItem === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentDimension === dimensions.length - 1 &&
                currentItem === dimensions[currentDimension].items.length - 1
                  ? "Submit Test"
                  : "Next"}
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
