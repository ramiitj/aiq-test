import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, TrendingUp, Award, Lightbulb, CheckCircle, ArrowRight, GraduationCap, Briefcase, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      title: "Verified Certification",
      description: "Shareable certificate backed by peer-reviewed research to showcase your AI collaboration skills.",
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
      time: "90 minutes",
      icon: GraduationCap,
      gradient: "from-blue-500 to-indigo-600",
      recommended: false,
      idealFor: "Students, career changers, and those new to AI",
      details: "8 questions per dimension (fixed)",
      prerequisites: "Basic computer skills and curiosity about AI",
      demonstrates: [
        "Understanding of AI basics and core concepts",
        "Ability to work with AI tools in simple scenarios",
        "Foundational awareness of AI ethics and limitations",
        "Basic prompt engineering techniques"
      ]
    },
    {
      id: "professional",
      title: "Professional",
      subtitle: "For working professionals",
      description: "Comprehensive assessment for professionals actively using AI in their work",
      questions: "80 questions",
      time: "120 minutes",
      icon: Briefcase,
      gradient: "from-violet-500 to-purple-600",
      recommended: false,
      idealFor: "Working professionals, managers, and AI practitioners",
      details: "10 questions per dimension (adaptive selection)",
      prerequisites: "Regular AI tool usage and 6+ months of practical experience",
      demonstrates: [
        "Advanced prompt engineering and iteration strategies",
        "Critical evaluation of AI outputs and quality assessment",
        "Integration of AI into complex workflows",
        "Strategic understanding of AI capabilities and limitations"
      ]
    },
    {
      id: "expert",
      title: "Expert",
      subtitle: "For AI leaders and researchers",
      description: "Advanced assessment for AI strategists, leaders, and research professionals",
      questions: "80 questions",
      time: "150 minutes",
      icon: Rocket,
      gradient: "from-amber-500 to-orange-600",
      recommended: false,
      idealFor: "Senior professionals, AI researchers, and organizational leaders",
      details: "10 questions per dimension (adaptive selection)",
      prerequisites: "Extensive AI experience, strategic decision-making role, or research background",
      demonstrates: [
        "Deep strategic understanding of AI technologies",
        "Expert-level prompt engineering and optimization",
        "Ethical AI governance and responsible deployment",
        "Innovation leadership and creative AI synthesis"
      ]
    },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />

      <main>
        {/* Hero Section */}
        <section className="container py-20 text-center max-w-5xl">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            Measure Your AI Collaboration Skills
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The first scientifically validated assessment of how effectively humans work with AI
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-base px-8 py-6 bg-blue-900 hover:bg-blue-800 font-semibold shadow-lg">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
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
            <h2 className="text-4xl font-extrabold mb-3 text-center tracking-tight">Why AIQ Matters</h2>
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

        {/* Assessment Levels Section */}
        <section className="bg-secondary/30 py-16">
          <div className="container max-w-6xl">
            <h2 className="text-4xl font-extrabold text-center mb-3 tracking-tight">Choose Your Assessment Level</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Select the assessment that matches your current experience with AI
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {assessmentLevels.map((level) => {
                const Icon = level.icon;
                return (
                  <Card key={level.id} className="shadow-sm border relative overflow-hidden hover:shadow-lg transition-shadow">
                    {level.recommended && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold z-10">
                        Recommended
                      </div>
                    )}
                    <CardContent className="pt-6 pb-6">
                      <div className={`inline-flex items-center gap-2 mb-3 p-3 bg-gradient-to-br ${level.gradient} rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-extrabold mb-2">{level.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{level.description}</p>
                      
                      {/* Assessment Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-semibold">{level.questions}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-semibold">{level.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-muted-foreground text-xs">{level.details}</span>
                        </div>
                      </div>

                      {/* Ideal For */}
                      <div className="mb-4 p-3 bg-secondary/30 rounded-lg">
                        <p className="text-xs font-bold text-muted-foreground mb-1">IDEAL FOR:</p>
                        <p className="text-xs font-semibold">{level.idealFor}</p>
                      </div>

                      {/* What You'll Demonstrate */}
                      {level.demonstrates && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-muted-foreground">YOU'LL DEMONSTRATE:</p>
                          <ul className="space-y-1.5">
                            {level.demonstrates.slice(0, 3).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span className="text-muted-foreground leading-tight">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Research Foundation */}
        <section className="container py-16 max-w-5xl">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-lg border-2">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-extrabold mb-3 text-center tracking-tight">Built on Rigorous Research</h2>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Developed at IIT Jodhpur and validated through peer-reviewed academic research
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-blue-900 mb-1">400+</div>
                  <p className="text-xs text-muted-foreground font-semibold">Calibrated Items</p>
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
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16">
          <div className="container text-center max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">Ready to Measure Your AIQ?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join professionals worldwide who are measuring and improving their AI collaboration skills
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
              <Link to="/auth">
                <Button
                  size="lg"
                  className="text-base px-10 py-6 bg-white text-blue-900 hover:bg-gray-100 font-semibold shadow-xl"
                >
                  Start Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <p className="text-xs mt-5 opacity-75">Free assessment • Instant results • Shareable certificate</p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-secondary/20">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-semibold">Venkat Ram Reddy Ganuthula, Ph.D. & Krishna Kumar Balaraman, Ph.D.</p>
          <p className="mt-1">School of Management and Entrepreneurship, IIT Jodhpur</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
