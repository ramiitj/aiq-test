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
      idealFor: "AI practitioners",
      highlighted: true
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
        <section className="container py-24 text-center max-w-5xl">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
            <img src={aiqBrainLogo} alt="AIQ Logo" className="h-12 w-12" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1]">
            Measure Your AI Intelligence
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Discover how effectively you work with AI through the world's first research-backed 
            assessment of AI collaboration skills.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-10 py-6 bg-blue-900 hover:bg-blue-800">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-6 bg-blue-900 hover:bg-blue-800">
                  Take the Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Backed by peer-reviewed research • 400+ calibrated items • IRT methodology
          </p>
        </section>

        {/* Why It Matters Section */}
        <section className="bg-secondary/30 py-20">
          <div className="container max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Why Your AIQ Matters
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              AI is transforming every industry. Your ability to effectively collaborate with AI tools 
              is becoming as important as any technical skill. Know where you stand.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">92%</div>
                <p className="text-muted-foreground">of companies plan to increase AI adoption in 2025</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">65%</div>
                <p className="text-muted-foreground">of employees lack AI literacy training</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">$16T</div>
                <p className="text-muted-foreground">potential economic impact of AI by 2030</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-20 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">
            What Makes This Assessment Unique
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
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
        <section className="bg-secondary/30 py-20">
          <div className="container max-w-6xl">
            <h2 className="text-4xl font-bold text-center mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Select the assessment that matches your experience level with AI
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {assessmentLevels.map((level, index) => (
                <Card 
                  key={index} 
                  className={`shadow-sm ${level.highlighted ? 'border-primary border-2 shadow-md' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className={`inline-block px-3 py-1 ${level.badgeColor} rounded-full text-sm font-semibold mb-4`}>
                      {level.badge}
                    </div>
                    {level.highlighted && (
                      <div className="text-xs font-semibold text-primary mb-2">MOST POPULAR</div>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{level.title}</h3>
                    <p className="text-muted-foreground mb-6">{level.description}</p>
                    <ul className="space-y-3 text-sm mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{level.questions}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{level.duration}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{level.dimensions}</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground italic">
                      Ideal for: {level.idealFor}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Research Foundation Section */}
        <section className="container py-20 max-w-5xl">
          <div className="bg-card rounded-lg p-10 border shadow-sm text-center">
            <h2 className="text-3xl font-bold mb-4">
              Built on Rigorous Research
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              This assessment uses Item Response Theory (IRT) and has been validated through 
              peer-reviewed academic research measuring 8 critical dimensions of AI competency.
            </p>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">400+</div>
                <p className="text-sm text-muted-foreground">Calibrated Items</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">8</div>
                <p className="text-sm text-muted-foreground">Core Dimensions</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">IRT</div>
                <p className="text-sm text-muted-foreground">Adaptive Testing</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Research-Backed</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
          <div className="container text-center max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Discover Your AIQ?
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Join thousands of professionals and students measuring and improving 
              their AI collaboration skills.
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-10 py-6 bg-white text-blue-900 hover:bg-gray-100">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-6 bg-white text-blue-900 hover:bg-gray-100">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <p className="text-sm mt-6 opacity-75">
              Free to take • Results in minutes • Shareable certificate
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-secondary/20">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-medium">
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