import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Brain,
  TrendingUp,
  Award,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Rocket,
  Share2,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import AssessmentSelector from "@/components/AssessmentSelector";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSampleQuestion, setCurrentSampleQuestion] = useState(0);

  // Sample questions for preview
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

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

  const assessmentLevels = [
    {
      id: "beginner",
      title: "Beginner",
      subtitle: "For beginners and students",
      description: "Foundational AI literacy assessment for newcomers to AI collaboration",
      questions: "60 questions",
      time: "60 minutes",
      icon: GraduationCap,
      gradient: "from-blue-500 to-indigo-600",
      recommended: false,
      idealFor: "Students, career changers, and those new to AI",
      details: "7-8 questions per dimension (fixed)",
      prerequisites: "Basic computer skills and curiosity about AI",
      demonstrates: [
        "Understanding of AI basics and core concepts",
        "Ability to work with AI tools in simple scenarios",
        "Foundational awareness of AI ethics and limitations",
        "Basic prompt engineering techniques",
      ],
    },
    {
      id: "advanced",
      title: "Advanced",
      subtitle: "For AI professionals and leaders",
      description: "Advanced assessment for AI strategists, leaders, and research professionals",
      questions: "80 questions",
      time: "80 minutes",
      icon: Rocket,
      gradient: "from-amber-500 to-orange-600",
      recommended: false,
      idealFor: "AI professionals, researchers, and organizational leaders",
      details: "10 questions per dimension (adaptive selection)",
      prerequisites: "Extensive AI experience, strategic role, or research background",
      demonstrates: [
        "Deep strategic understanding of AI technologies",
        "Expert-level prompt engineering and optimization",
        "Ethical AI governance and responsible deployment",
        "Innovation leadership and creative AI synthesis",
      ],
    },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />

      <main>
        {/* Hero Section */}
        <section className="container py-20 text-center max-w-5xl">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            Measure Your AI Intelligence with the AIQ Assessment
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
            The AIQ assessment is a <strong>research-validated evaluation</strong> of your ability to collaborate
            effectively with artificial intelligence. Measure and develop your <strong>AI collaboration skills</strong> 
            across 8 key dimensions with personalized insights backed by <strong>peer-reviewed methodology</strong>.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-6">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-base px-8 py-6 bg-blue-900 hover:bg-blue-800 font-semibold shadow-lg">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/sign-in">
                <Button size="lg" className="text-base px-8 py-6 bg-blue-900 hover:bg-blue-800 font-semibold shadow-lg">
                  Start Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 font-semibold">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Published in <span className="font-semibold">Discover Artificial Intelligence</span> (Springer Nature, 2025)
          </p>
        </section>

        {/* Why It Matters */}
        <section className="bg-secondary/30 py-16">
          <div className="container max-w-6xl">
            <h2 className="text-4xl font-extrabold mb-3 text-center tracking-tight">
              Why AIQ<sup className="text-[0.6em]">™</sup> Matters
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              As AI transforms every industry, the ability to collaborate effectively with AI systems is becoming a
              critical skill
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center shadow-sm border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="text-5xl font-extrabold text-blue-900 mb-2">78%</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    of organizations now use AI in at least one function
                  </p>
                  <p className="text-xs text-muted-foreground/70">Stanford HAI AI Index 2025</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-sm border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="text-5xl font-extrabold text-blue-900 mb-2">55%</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    of companies lack resources to train employees on AI
                  </p>
                  <p className="text-xs text-muted-foreground/70">Express Employment 2025</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-sm border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="text-5xl font-extrabold text-blue-900 mb-2">$13T</div>
                  <p className="text-sm text-muted-foreground mb-2">potential AI economic value by 2030</p>
                  <p className="text-xs text-muted-foreground/70">McKinsey Global Institute</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16 max-w-6xl">
          <h2 className="text-4xl font-extrabold text-center mb-12 tracking-tight">
            What Makes This Assessment Unique
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

        {/* Three Assessment Tracks Overview */}
        <section className="container py-16 max-w-6xl">
          <h2 className="text-4xl font-extrabold text-center mb-3 tracking-tight">Three Assessment Pathways</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Choose the track that best fits your needs - from general assessments to role-specific evaluations
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold mb-2">General Track</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Universal AI collaboration intelligence for all professionals
                </p>
                <div className="text-3xl font-bold text-primary mb-4">2 Assessments</div>
                <p className="text-xs text-muted-foreground mb-6">Beginner & Advanced levels</p>
                <Link to="/assessments/general">
                  <Button className="w-full">Explore General Track</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold mb-2">Student Track</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Age-appropriate AI literacy for high school students
                </p>
                <div className="text-3xl font-bold text-primary mb-4">2 Age Groups</div>
                <p className="text-xs text-muted-foreground mb-6">Ages 14-15 & 16-17 years</p>
                <Link to="/assessments/adolescent">
                  <Button className="w-full">Explore Student Track</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold mb-2">Professional Track</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  15 professional roles with tailored AI assessments
                </p>
                <div className="text-3xl font-bold text-primary mb-4">30 Assessments</div>
                <p className="text-xs text-muted-foreground mb-6">Beginner & Advanced for each role</p>
                <Link to="/assessments/professional">
                  <Button className="w-full">Explore Professional Track</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Assessment Selector Section */}
        <section className="bg-secondary/30 py-16">
          <div className="container max-w-7xl">
            <AssessmentSelector />
          </div>
        </section>

        {/* Research Foundation */}
        <section className="container py-16 max-w-5xl">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-lg border-2">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-extrabold mb-3 text-center tracking-tight">Built on Rigorous Research</h2>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Validated through peer-reviewed academic research
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-blue-900 mb-1">400+</div>
                  <p className="text-xs text-muted-foreground font-semibold">Test Items</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Across all tracks & levels</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-blue-900 mb-1">8</div>
                  <p className="text-xs text-muted-foreground font-semibold">Core Dimensions</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-blue-900 mb-1">IRT</div>
                  <p className="text-xs text-muted-foreground font-semibold">Adaptive Method</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-blue-900 mb-1">2025</div>
                  <p className="text-xs text-muted-foreground font-semibold">Published</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Ganuthula & Balaraman (2025), Discover Artificial Intelligence
                </p>
                <a
                  href="https://link.springer.com/epdf/10.1007/s44163-025-00516-1?sharing_token=T6xe9nZzrWS-C-ANGiDQV_e4RwlQNchNByi7wbcMAY6YdayLiwdIOdDO4XNZbgLvZSQyi_Fj10NE-qC63u4Uuk-HXsnEOE776OwTqhqvFbE7eSi796eIPBck33pH9cCkWzgkpfBXUyX1LgBPrj5DS1iggJOQ9h91dxbrHABq1wk%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="outline" size="lg" className="font-semibold">
                    Read Full Paper <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 pt-6 border-t container max-w-4xl">
            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
              This assessment represents academic rigor in measuring AI collaboration skills. As AI capabilities 
              evolve rapidly, standardized competency frameworks like AIQ provide structured approaches to skill 
              development—valuable for professionals building expertise in this emerging domain.
            </p>
          </div>
        </section>

        {/* Real-World Value & Skills Development */}
        <section className="container py-16 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
              Your AI Skills Development Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The AIQ assessment provides research-backed validation of your AI collaboration capabilities—a rapidly 
              emerging skill set that organizations are beginning to prioritize
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  What This Assessment Demonstrates
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Scientifically validated skills:</strong> Peer-reviewed methodology published in academic journals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Concrete competency measurement:</strong> Objective assessment across 8 AI collaboration dimensions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Professional development roadmap:</strong> Personalized insights for continuous improvement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Skills portfolio evidence:</strong> Shareable documentation of your AI capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Growing Industry Recognition
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Emerging credential:</strong> As AI skills become critical, evidence-based assessments gain importance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Academic foundation:</strong> Built on rigorous research recognized by academic institutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Early adopter advantage:</strong> Demonstrate forward-thinking commitment to AI competency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <span><strong>Conversation starter:</strong> Use results to discuss AI skills in interviews and reviews</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Transparency note:</strong> The AIQ assessment is an emerging professional 
              credential backed by peer-reviewed research. While not yet formally recognized by major corporations or 
              certification bodies, it provides valuable, evidence-based validation of AI collaboration skills—a capability 
              that organizations increasingly seek but few can objectively measure. Use your results as part of a broader 
              skills portfolio to demonstrate your AI readiness.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container py-16 max-w-4xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-4xl font-extrabold text-center mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Everything you need to know about the AIQ assessment
          </p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold">What is AIQ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                AIQ (Artificial Intelligence Quotient) is a scientifically validated measure of an individual's ability
                to effectively collaborate with AI systems. It assesses 8 key dimensions of AI collaboration
                intelligence through a comprehensive, research-based assessment including strategic understanding,
                prompt engineering, critical evaluation, and ethical judgment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold">
                How long does the AIQ assessment take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Assessment duration varies by track: General Track assessments are 60 minutes (Beginner) or 80 minutes (Advanced),
                Student Track assessments are 24 minutes (Ages 14-15) or 48 minutes (Ages 16-17), and Professional Track assessments
                follow the same 60/80 minute structure as General Track based on the level you choose.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold">Is the AIQ assessment free?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, the AIQ assessment is completely free. You'll receive instant results with a detailed analysis of
                your AI collaboration abilities across 8 dimensions, personalized insights into your strengths and
                growth areas, and a shareable certificate (for those who pass) that you can add to your professional
                profiles.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-semibold">How is AIQ different from IQ?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                While IQ measures general cognitive abilities like reasoning and problem-solving, AIQ specifically
                measures your ability to collaborate effectively with AI systems. It assesses specialized skills like AI
                prompt engineering, critical evaluation of AI outputs, ethical AI use, creative problem-solving with AI
                tools, and strategic understanding of AI capabilities and limitations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-semibold">
                Which assessment level should I choose?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Choose Beginner if you're new to AI or have less than 1 year of experience with AI tools. Select
                Advanced if you're an AI professional, leader, researcher, or have extensive strategic experience with
                AI systems. The Advanced assessment uses adaptive testing to provide precise measurement across all
                skill levels.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-semibold">
                Is the AIQ assessment scientifically validated?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes! The AIQ assessment is backed by rigorous peer-reviewed academic research published in Discover
                Artificial Intelligence (Springer Nature, 2025). It uses Item Response Theory (IRT), the same
                psychometric methodology used in standardized tests like the GRE and SAT. The assessment was developed
                with 400+ calibrated items across all tracks and validated dimensions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left font-semibold">Can I retake the assessment?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, you can retake the assessment at any time to track your improvement. We recommend waiting at least
                2-3 weeks between attempts to allow time for learning and skill development. Your dashboard will show
                all your assessment history, allowing you to monitor your progress over time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left font-semibold">
                What do I get after completing the assessment?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                After completing the assessment, you'll receive: (1) Your overall AIQ score and classification, (2)
                Detailed breakdown of your performance across all 8 dimensions, (3) Personalized insights highlighting
                your strengths and areas for growth, (4) A verifiable digital certificate (for those who pass) with a
                unique QR code that you can share on LinkedIn, resume, or professional profiles, and (5) Access to your
                complete assessment history in your dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left font-semibold">
                Is the AIQ certificate recognized by employers?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                The AIQ assessment is an emerging credential backed by peer-reviewed academic research. While it is not 
                yet formally recognized by Fortune 500 companies or major certification bodies, it provides scientifically 
                validated evidence of AI collaboration skills—competencies that organizations increasingly value but lack 
                standardized ways to measure. The assessment is most valuable as: (1) A tool for personal skill development 
                and tracking progress, (2) Evidence of your commitment to AI competency in professional conversations, 
                (3) A structured way to identify and address skill gaps, and (4) Documentation for your professional 
                portfolio as AI skills become more critical across industries. As the field matures, research-backed 
                assessments like AIQ are positioned to become recognized standards for measuring AI collaboration abilities.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16">
          <div className="container text-center max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to Measure Your AIQ<sup className="text-[0.6em]">™</sup>?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join early adopters building and validating their AI collaboration skills with research-backed assessment
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
            <p className="text-xs mt-5 opacity-75">Research-validated • Actionable insights • Skills documentation</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
