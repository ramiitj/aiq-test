import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ArrowRight, Sparkles, GraduationCap, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssessmentRecommendationQuizProps {
  open: boolean;
  onClose: () => void;
}

interface Recommendation {
  track: "general" | "student" | "professional";
  level: "beginner" | "advanced";
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

export const AssessmentRecommendationQuiz = ({ open, onClose }: AssessmentRecommendationQuizProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    ageGroup: "",
    experience: "",
    purpose: "",
    background: "",
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const handleAnswer = (question: keyof typeof answers, value: string) => {
    const newAnswers = { ...answers, [question]: value };
    setAnswers(newAnswers);

    // Auto-advance to next step
    if (step < getTotalSteps(newAnswers)) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Calculate recommendation
      const result = calculateRecommendation(newAnswers);
      setRecommendation(result);
    }
  };

  const getTotalSteps = (currentAnswers: typeof answers) => {
    // Students only need 2 questions (age + purpose)
    if (currentAnswers.ageGroup === "under-18") return 2;
    // Adults need 4 questions
    return 4;
  };

  const calculateRecommendation = (finalAnswers: typeof answers): Recommendation => {
    // Student track
    if (finalAnswers.ageGroup === "under-18") {
      return {
        track: "student",
        level: "beginner",
        title: "Student AI Assessment",
        description: "Age-appropriate assessment designed for young learners to explore AI collaboration skills in an educational context.",
        icon: <GraduationCap className="w-6 h-6" />,
        link: "/assessments/student",
      };
    }

    // Professional track
    if (finalAnswers.background === "professional" || finalAnswers.background === "manager") {
      return {
        track: "professional",
        level: finalAnswers.experience === "expert" ? "advanced" : "beginner",
        title: `Professional AI Assessment (${finalAnswers.experience === "expert" ? "Advanced" : "Beginner"})`,
        description: "Role-specific assessment tailored to your profession with specialized AI dimensions and industry-relevant scenarios.",
        icon: <Briefcase className="w-6 h-6" />,
        link: "/assessments/professional",
      };
    }

    // General track
    const isAdvanced = finalAnswers.experience === "expert" || finalAnswers.experience === "experienced";
    return {
      track: "general",
      level: isAdvanced ? "advanced" : "beginner",
      title: `General AI Assessment (${isAdvanced ? "Advanced" : "Beginner"})`,
      description: isAdvanced
        ? "Comprehensive advanced assessment with adaptive IRT-based item selection for experienced AI users seeking certification."
        : "Foundational assessment covering core AI collaboration competencies for those new to AI tools.",
      icon: <Brain className="w-6 h-6" />,
      link: "/assessments/general",
    };
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({ ageGroup: "", experience: "", purpose: "", background: "" });
    setRecommendation(null);
  };

  const handleStartAssessment = () => {
    if (recommendation) {
      navigate(recommendation.link);
      onClose();
      handleReset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Find Your Perfect Assessment
          </DialogTitle>
          <DialogDescription>
            Answer a few quick questions to get a personalized recommendation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!recommendation ? (
            <>
              {/* Progress indicator */}
              <div className="flex gap-2">
                {Array.from({ length: getTotalSteps(answers) }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Question 1: Age Group */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What is your age group?</h3>
                  <RadioGroup value={answers.ageGroup} onValueChange={(value) => handleAnswer("ageGroup", value)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="under-18" id="under-18" />
                        <Label htmlFor="under-18" className="flex-1 cursor-pointer">
                          Under 18 years old
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="18-plus" id="18-plus" />
                        <Label htmlFor="18-plus" className="flex-1 cursor-pointer">
                          18 years or older
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Question 2: Experience Level (only for 18+) */}
              {step === 2 && answers.ageGroup === "18-plus" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What's your experience with AI tools?</h3>
                  <RadioGroup value={answers.experience} onValueChange={(value) => handleAnswer("experience", value)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="new" id="new" />
                        <Label htmlFor="new" className="flex-1 cursor-pointer">
                          <div className="font-medium">New to AI</div>
                          <div className="text-sm text-muted-foreground">Just getting started with AI tools</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="some" id="some" />
                        <Label htmlFor="some" className="flex-1 cursor-pointer">
                          <div className="font-medium">Some experience</div>
                          <div className="text-sm text-muted-foreground">Use AI tools occasionally</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="experienced" id="experienced" />
                        <Label htmlFor="experienced" className="flex-1 cursor-pointer">
                          <div className="font-medium">Regular user</div>
                          <div className="text-sm text-muted-foreground">Use AI tools frequently in work or life</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="expert" id="expert" />
                        <Label htmlFor="expert" className="flex-1 cursor-pointer">
                          <div className="font-medium">Expert / Power user</div>
                          <div className="text-sm text-muted-foreground">Deep experience with multiple AI systems</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Question 2 for students / Question 3 for adults: Purpose */}
              {((step === 2 && answers.ageGroup === "under-18") || (step === 3 && answers.ageGroup === "18-plus")) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What's your primary purpose?</h3>
                  <RadioGroup value={answers.purpose} onValueChange={(value) => handleAnswer("purpose", value)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="learning" id="learning" />
                        <Label htmlFor="learning" className="flex-1 cursor-pointer">
                          Learning / Personal development
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="career" id="career" />
                        <Label htmlFor="career" className="flex-1 cursor-pointer">
                          Career development / Job skills
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="certification" id="certification" />
                        <Label htmlFor="certification" className="flex-1 cursor-pointer">
                          Professional certification
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Question 4: Professional Background (only for 18+) */}
              {step === 4 && answers.ageGroup === "18-plus" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What's your professional background?</h3>
                  <RadioGroup value={answers.background} onValueChange={(value) => handleAnswer("background", value)}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="flex-1 cursor-pointer">
                          Student / Recent graduate
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="professional" id="professional" />
                        <Label htmlFor="professional" className="flex-1 cursor-pointer">
                          Working professional (specific role)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="manager" id="manager" />
                        <Label htmlFor="manager" className="flex-1 cursor-pointer">
                          Manager / Team leader
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-colors">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general" className="flex-1 cursor-pointer">
                          General / Exploring options
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </>
          ) : (
            /* Recommendation Result */
            <Card className="border-2 border-primary">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {recommendation.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-2">{recommendation.title}</h3>
                    <p className="text-muted-foreground">{recommendation.description}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    Retake Quiz
                  </Button>
                  <Button onClick={handleStartAssessment} className="flex-1">
                    View Assessment
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
