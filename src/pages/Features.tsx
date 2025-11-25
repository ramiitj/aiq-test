import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Brain,
  TrendingUp,
  Award,
  Lightbulb,
  CheckCircle,
  Share2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Features = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSampleQuestion, setCurrentSampleQuestion] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const sampleQuestions = [
    {
      question: "Which of the following best describes the primary advantage of using AI-powered tools for content generation?",
      dimension: "Strategic AI Understanding",
      options: [
        'Eliminates the need for human oversight',
        'Accelerates ideation and drafting processes',
        'Guarantees factual accuracy in all outputs',
        'Replaces domain expertise requirements'
      ],
      correctAnswer: 1
    },
    {
      question: "When crafting prompts for an AI system, which approach is most effective for obtaining precise, actionable outputs?",
      dimension: "Prompt Engineering & Iteration",
      options: [
        'Using vague, open-ended instructions',
        'Providing specific context and desired output format',
        'Asking multiple unrelated questions simultaneously',
        'Avoiding examples to let AI interpret freely'
      ],
      correctAnswer: 1
    },
    {
      question: "What is the most critical factor when evaluating AI-generated content for professional use?",
      dimension: "Critical Evaluation & Calibration",
      options: [
        'Length and formatting of the output',
        'Speed of generation',
        'Accuracy, relevance, and alignment with goals',
        'Complexity of vocabulary used'
      ],
      correctAnswer: 2
    }
  ];

  const handleNextSample = () => {
    setCurrentSampleQuestion((prev) => (prev + 1) % sampleQuestions.length);
  };

  const currentSample = sampleQuestions[currentSampleQuestion];

  const features = [
    {
      icon: Brain,
      title: "Adaptive Testing",
      description:
        "Questions adjust to your skill level using Item Response Theory (IRT), the same methodology used in GRE and SAT exams.",
    },
    {
      icon: TrendingUp,
      title: "8 Dimension Analysis",
      description:
        "Comprehensive assessment across strategic understanding, prompt engineering, critical evaluation, and ethical judgment.",
    },
    {
      icon: Award,
      title: "Research-Backed Certificate",
      description:
        "Shareable certificate documenting your AI collaboration competencies, validated through peer-reviewed methodology.",
    },
    {
      icon: Lightbulb,
      title: "Personalized Insights",
      description:
        "Detailed feedback on your strengths and growth areas with targeted recommendations for improvement.",
    },
  ];

  const dimensions = [
    {
      code: "SAU",
      name: "Strategic AI Understanding",
      description: "Grasping the big picture of AI's capabilities and limitations for effective collaboration"
    },
    {
      code: "PEI",
      name: "Prompt Engineering & Iteration",
      description: "Crafting and refining instructions to guide AI systems toward desired outcomes"
    },
    {
      code: "CEC",
      name: "Critical Evaluation & Calibration",
      description: "Assessing AI outputs for accuracy, relevance, and alignment with goals"
    },
    {
      code: "II",
      name: "Innovation & Integration",
      description: "Identifying opportunities to leverage AI tools for creative problem-solving"
    },
    {
      code: "ALC",
      name: "Adaptive Learning & Collaboration",
      description: "Continuously updating knowledge of AI tools and best practices"
    },
    {
      code: "EJC",
      name: "Ethical Judgment & Compliance",
      description: "Ensuring responsible, fair, and transparent use of AI systems"
    },
    {
      code: "CS",
      name: "Communication & Synthesis",
      description: "Translating AI insights into clear, actionable communication"
    },
    {
      code: "CRS",
      name: "Contextual Reasoning & Strategy",
      description: "Applying AI tools within the specific context of your role and objectives"
    }
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <main>
        {/* Hero Section */}
        <section className="container py-20 text-center max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            What Makes AIQ Unique
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover the innovative features and rigorous methodology behind the research-validated AIQ assessment
          </p>
        </section>

        {/* Features Section */}
        <section className="container py-16 max-w-6xl px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 tracking-tight">
            Unique Assessment Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-blue-900/10 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-900" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Certificate Preview Section */}
        <section className="container section-spacing max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="professional-heading">Professional Certification</h2>
            <p className="professional-subheading max-w-2xl mx-auto">
              Upon successful completion, receive a verified certificate recognized by industry professionals worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Certificate Image Preview */}
            <div className="relative">
              <div className="aspect-[1.414/1] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 overflow-hidden">
                <div className="border-4 border-double border-gray-800 dark:border-gray-200 p-3 sm:p-5 h-full flex flex-col">
                  <div className="text-center mb-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold">AIQ Assessment™</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Certificate of Achievement</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-1.5 sm:space-y-2">
                    <p className="text-center text-[10px] sm:text-xs">This certifies that</p>
                    <p className="text-center font-serif text-base sm:text-lg font-bold">Certificate Holder</p>
                    <p className="text-center text-[10px] sm:text-xs leading-snug">has successfully demonstrated proficiency in</p>
                    <p className="text-center font-semibold text-xs sm:text-sm">AI Collaboration & Intelligence</p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-center text-[10px] sm:text-xs text-muted-foreground leading-tight">
                        Score: 85% | Verification: ABC123XYZ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Verified
              </div>
            </div>
            
            {/* Right: Certificate Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Blockchain-Verified</h4>
                  <p className="text-sm text-muted-foreground">
                    Unique verification code ensures authenticity and prevents fraud
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Research-Validated</h4>
                  <p className="text-sm text-muted-foreground">
                    Backed by peer-reviewed methodology published in academic journals
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Share2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Shareable Credentials</h4>
                  <p className="text-sm text-muted-foreground">
                    Add to LinkedIn, resume, or portfolio with verifiable proof of competency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Test Preview Section */}
        <section className="bg-secondary/30 section-spacing">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="professional-heading">Experience the Assessment</h2>
              <p className="professional-subheading">
                Preview sample questions from our beginner assessment to understand what to expect
              </p>
            </div>
            
            <Card className="test-card">
              <CardHeader className="test-section-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-semibold">Sample Question</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dimension: {currentSample.dimension}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-muted-foreground">
                      Question {currentSampleQuestion + 1} of {sampleQuestions.length}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-base leading-relaxed mb-6">
                  {currentSample.question}
                </p>
                <div className="space-y-3">
                  {currentSample.options.map((option, i) => (
                    <button
                      key={i}
                      className="question-option"
                      disabled
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full border-2 font-mono font-semibold text-sm">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 text-left">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {currentSampleQuestion < sampleQuestions.length - 1 
                      ? 'Click to see the next sample question' 
                      : 'This is a preview - start the real assessment to get your score'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleNextSample}
                  >
                    {currentSampleQuestion < sampleQuestions.length - 1 
                      ? 'Next Sample Question' 
                      : 'Back to First Question'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 8 Dimensions Detail Section */}
        <section className="container py-16 max-w-6xl">
          <h2 className="text-4xl font-extrabold text-center mb-4 tracking-tight">
            The 8 Dimensions of AI Intelligence
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            AIQ evaluates your capabilities across eight scientifically validated dimensions of AI collaboration
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {dimensions.map((dimension, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border">
                <CardContent className="pt-6 pb-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-900/10 rounded-lg flex items-center justify-center">
                        <span className="text-blue-900 font-bold text-sm">{dimension.code}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{dimension.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{dimension.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16">
          <div className="container text-center max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to Measure Your AIQ<sup className="text-[0.6em]">™</sup>?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Start your assessment and discover your AI collaboration strengths
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="text-base px-10 py-6 bg-white text-blue-900 hover:bg-gray-100 font-semibold shadow-xl"
                >
                  Start Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/sign-in">
                <Button
                  size="lg"
                  className="text-base px-10 py-6 bg-white text-blue-900 hover:bg-gray-100 font-semibold shadow-xl"
                >
                  Start Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
