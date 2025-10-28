import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, TrendingUp, Award, Lightbulb, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import aiqBrainLogo from "@/assets/aiq-brain-logo.png";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const features = [
    {
      icon: Brain,
      title: "Adaptive Testing",
      description: "Questions adjust to your skill level in real-time, ensuring accurate measurement across all proficiency ranges."
    },
    {
      icon: TrendingUp,
      title: "Dimension Insights",
      description: "Get detailed breakdowns across 8 key areas of AI competency, from prompt engineering to ethical reasoning."
    },
    {
      icon: Award,
      title: "Shareable Certification",
      description: "Receive a verified certificate you can share with employers, add to your resume, or showcase on LinkedIn."
    },
    {
      icon: Lightbulb,
      title: "Personalized Growth Path",
      description: "Get actionable recommendations tailored to your results, with resources to strengthen your weak areas."
    }
  ];

  const assessmentLevels = [
    {
      badge: "Beginner",
      badgeColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      title: "Foundational",
      description: "Perfect for AI newcomers building core literacy",
      questions: "24 questions",
      duration: "15 minutes",
      dimensions: "Core concepts",
      idealFor: "Students and beginners"
    },
    {
      badge: "Professional",
      badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      title: "Comprehensive",
      description: "For professionals actively using AI",
      questions: "80 questions",
      duration: "60 minutes",
      dimensions: "8 full dimensions",
      idealFor: "AI practitioners"
    },
    {
      badge: "Expert",
      badgeColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      title: "Advanced",
      description: "For AI leaders and specialists",
      questions: "80 questions",
      duration: "60 minutes",
      dimensions: "Advanced topics",
      idealFor: "Experts and researchers"
    }
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <main>
        {/* Hero Section */}
        <section className="container py-16 text-center max-w-5xl">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <img src={aiqBrainLogo} alt="AIQ Logo" className="h-12 w-12" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-4 tracking-tight leading-[1.05] bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            Measure Your AI Intelligence
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover how effectively you work with AI through the world's first research-backed 
            assessment of AI collaboration skills.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-base px-8 py-5 bg-blue-900 hover:bg-blue-800 font-semibold">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-base px-8 py-5 bg-blue-900 hover:bg-blue-800 font-semibold">
                  Take the Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-base px-8 py-5 font-semibold">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-5 font-medium">
            Backed by peer-reviewed research • 400+ calibrated items • IRT methodology
          </p>
        </section>

        {/* Why It Matters Section */}
        <section className="bg-secondary/30 py-14">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl lg:text-4xl font-black mb-3 tracking-tight">
              Why Your AIQ Matters
            </h2>
            <p className="text-base text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              AI is transforming every industry. Your ability to effectively collaborate with AI tools 
              is becoming as important as any technical skill. Know where you stand.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-card p-5 rounded-lg shadow-sm border">
                <div className="text-4xl font-black text-primary mb-1">92%</div>
                <p className="text-sm text-muted-foreground leading-snug">of companies plan to increase AI adoption in 2025</p>
              </div>
              <div className="bg-card p-5 rounded-lg shadow-sm border">
                <div className="text-4xl font-black text-primary mb-1">65%</div>
                <p className="text-sm text-muted-foreground leading-snug">of employees lack AI literacy training</p>
              </div>
              <div className="bg-card p-5 rounded-lg shadow-sm border">
                <div className="text-4xl font-black text-primary mb-1">$16T</div>
                <p className="text-sm text-muted-foreground leading-snug">potential economic impact of AI by 2030</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-14 max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-black text-center mb-10 tracking-tight">
            What Makes This Assessment Unique
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-2.5 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1.5">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Assessment Levels Section */}
        <section className="bg-secondary/30 py-14">
          <div className="container max-w-6xl">
            <h2 className="text-3xl lg:text-4xl font-black text-center mb-3 tracking-tight">
              Choose Your Path
            </h2>
            <p className="text-base text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              Select the assessment that matches your experience level with AI
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {assessmentLevels.map((level, index) => (
                <Card 
                  key={index} 
                  className="shadow-sm hover:shadow-lg transition-all hover:scale-105 border"
                >
                  <CardContent className="pt-5 pb-5">
                    <div className={`inline-block px-3 py-1 ${level.badgeColor} rounded-full text-xs font-bold mb-3`}>
                      {level.badge}
                    </div>
                    <h3 className="text-2xl font-black mb-1.5">{level.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5 leading-snug">{level.description}</p>
                    <ul className="space-y-2 text-sm mb-5">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="font-medium">{level.questions}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="font-medium">{level.duration}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="font-medium">{level.dimensions}</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground italic font-medium">
                      Ideal for: {level.idealFor}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Research Foundation Section */}
        <section className="container py-14 max-w-5xl">
          <div className="bg-card rounded-lg p-8 border shadow-sm text-center">
            <h2 className="text-2xl lg:text-3xl font-black mb-3 tracking-tight">
              Built on Rigorous Research
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              This assessment uses Item Response Theory (IRT) and has been validated through 
              peer-reviewed academic research measuring 8 critical dimensions of AI competency.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-4xl font-black text-primary mb-1">400+</div>
                <p className="text-xs text-muted-foreground font-medium">Calibrated Items</p>
              </div>
              <div>
                <div className="text-4xl font-black text-primary mb-1">8</div>
                <p className="text-xs text-muted-foreground font-medium">Core Dimensions</p>
              </div>
              <div>
                <div className="text-4xl font-black text-primary mb-1">IRT</div>
                <p className="text-xs text-muted-foreground font-medium">Adaptive Testing</p>
              </div>
              <div>
                <div className="text-4xl font-black text-primary mb-1">100%</div>
                <p className="text-xs text-muted-foreground font-medium">Research-Backed</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16">
          <div className="container text-center max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
              Ready to Discover Your AIQ?
            </h2>
            <p className="text-lg mb-8 opacity-90 font-medium">
              Join thousands of professionals and students measuring and improving 
              their AI collaboration skills.
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-base px-8 py-5 bg-white text-blue-900 hover:bg-gray-100 font-semibold shadow-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-base px-8 py-5 bg-white text-blue-900 hover:bg-gray-100 font-semibold shadow-lg">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <p className="text-xs mt-5 opacity-75 font-medium">
              Free to take • Results in minutes • Shareable certificate
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-secondary/20">
        <div className="container text-center text-xs text-muted-foreground">
          <p className="font-semibold">
            Research by Venkat Ram Reddy Ganuthula & Krishna Kumar Balaraman
          </p>
          <p className="mt-1">
            School of Management and Entrepreneurship, IIT Jodhpur
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;