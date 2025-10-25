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

// Sample test data structure (in production, load from Storage)
const sampleDimensions = [
  {
    name: "Strategic AI Understanding",
    items: Array.from({ length: 10 }, (_, i) => ({
      id: `strat_${i}`,
      difficulty: i < 4 ? "easy" : i < 7 ? "medium" : "hard",
      question: `Strategic AI scenario ${i + 1}: How would you map AI capabilities to optimize a marketing campaign while identifying cultural and ethical limitations?`,
      type: "mcq",
      options: [
        "A: Focus only on data-driven predictions without considering cultural context",
        "B: Map AI to predictive analytics while noting limitations in cultural nuance interpretation",
        "C: Avoid AI entirely due to ethical concerns",
        "D: Use AI for all decisions without human oversight"
      ],
      correct: "B"
    }))
  },
  // Add other 7 dimensions here
];

const Test = () => {
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [testId, setTestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

    try {
      const { data, error } = await supabase
        .from("tests")
        .insert({
          user_id: session.user.id,
          json_version: "v1.0",
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
    const currentQuestion = sampleDimensions[currentDimension].items[currentItem];
    
    if (!answers[currentQuestion.id]) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentItem < sampleDimensions[currentDimension].items.length - 1) {
      setCurrentItem(currentItem + 1);
    } else if (currentDimension < sampleDimensions.length - 1) {
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
      const scores = sampleDimensions.map((dim) => {
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="container py-8">
          <div className="text-center">Initializing test...</div>
        </div>
      </div>
    );
  }

  const currentQuestion = sampleDimensions[currentDimension].items[currentItem];
  const totalItems = sampleDimensions.reduce((sum, dim) => sum + dim.items.length, 0);
  const completedItems = currentDimension * 10 + currentItem;
  const progress = (completedItems / totalItems) * 100;

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
                {sampleDimensions[currentDimension].name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Question {currentItem + 1} of {sampleDimensions[currentDimension].items.length}
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
                    setCurrentItem(sampleDimensions[currentDimension - 1].items.length - 1);
                  }
                }}
                disabled={currentDimension === 0 && currentItem === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentDimension === sampleDimensions.length - 1 &&
                currentItem === sampleDimensions[currentDimension].items.length - 1
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
