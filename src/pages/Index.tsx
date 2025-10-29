import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, TrendingUp, Award, Lightbulb, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
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
        "Questions adjust to your skill level in real-time for accurate measurement across all proficiency ranges.",
    },
    {
      icon: TrendingUp,
      title: "Dimension Insights",
      description:
        "Detailed breakdowns across 8 key areas of AI competency, from prompt engineering to ethical reasoning.",
    },
    {
      icon: Award,
      title: "Shareable Certification",
      description: "Verified certificate you can share with employers, add to your resume, or showcase on LinkedIn.",
    },
    {
      icon: Lightbulb,
      title: "Personalized Growth Path",
      description: "Actionable recommendations tailored to your results with resources to strengthen your skills.",
    },
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
      idealFor: "Students and beginners",
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
      highlighted: true,
    },
    {
      badge: "Expert",
      badgeColor: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      title: "Advanced",
      description: "For AI leaders and specialists",
      questions: "80 questions",
      duration: "60 minutes",
      dimensions: "Advanced topics",
      idealFor: "Experts and researchers",
    },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />

      <main>
        {/* Hero Section - Compact */}
        <section className="container py-16 text-center max-w-5xl">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            Measure Your AI Intelligence
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The world's first research-backed assessment of AI collaboration skills
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
                  Take the Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 font-semibold">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Peer-reviewed research • 400+ calibrated items • IRT methodology
          </p>
        </section>

        {/* Why It Matters - Visual Grid */}
        <section className="bg-secondary/30 py-16">
          <div className="container max-w-6xl">
            <h2 className="text-4xl font-extrabold mb-3 text-center tracking-tight">Why Your AIQ Matters</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              AI collaboration skills are becoming essential in every industry
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center shadow-sm border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="text-5xl font-extrabold text-blue-900 mb-2">92%</div>
                  <p className="text-sm text-muted-foreground">of companies increasing AI adoption</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-sm border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="text-5xl font-extrabold text-blue-900 mb-2">65%</div>
                  <p className="text-sm text-muted-foreground">of employees lack AI training</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-sm border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="text-5xl font-extrabold text-blue-900 mb-2">$16T</div>
                  <p className="text-sm text-muted-foreground">potential AI economic impact by 2030</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section - Compact */}
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
            <h2 className="text-4xl font-extrabold text-center mb-3 tracking-tight">Choose Your Path</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Select the assessment that matches your experience level
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {assessmentLevels.map((level, index) => (
                <Card
                  key={index}
                  className={`shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] border ${
                    level.highlighted ? "border-blue-900 border-2 ring-2 ring-blue-900/20" : ""
                  }`}
                >
                  <CardContent className="pt-6 pb-6">
                    {level.highlighted && (
                      <div className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        MOST POPULAR
                      </div>
                    )}
                    <div className={`inline-block px-3 py-1 ${level.badgeColor} rounded-full text-xs font-bold mb-3`}>
                      {level.badge}
                    </div>
                    <h3 className="text-2xl font-extrabold mb-2">{level.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5">{level.description}</p>
                    <ul className="space-y-2 text-sm mb-5">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{level.questions}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{level.duration}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{level.dimensions}</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground italic">Ideal for: {level.idealFor}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Research Foundation - More Visual */}
        <section className="container py-16 max-w-5xl">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-lg border-2">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-extrabold mb-3 text-center tracking-tight">Built on Rigorous Research</h2>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Validated through peer-reviewed academic research measuring 8 dimensions of AI competency
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
                  <p className="text-xs text-muted-foreground font-semibold">Adaptive Testing</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-blue-900 mb-1">2025</div>
                  <p className="text-xs text-muted-foreground font-semibold">Published Research</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Published in Discover Artificial Intelligence (Springer Nature)
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

        {/* CTA Section - Compact */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16">
          <div className="container text-center max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">Ready to Discover Your AIQ?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands measuring and improving their AI collaboration skills
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="text-base px-10 py-6 bg-white text-blue-900 hover:bg-gray-100 font-semibold shadow-xl"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button
                  size="lg"
                  className="text-base px-10 py-6 bg-white text-blue-900 hover:bg-gray-100 font-semibold shadow-xl"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <p className="text-xs mt-5 opacity-75">Free to take • Results in minutes • Shareable certificate</p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-secondary/20">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-semibold">Research by Venkat Ram Reddy Ganuthula & Krishna Kumar Balaraman</p>
          <p className="mt-1">School of Management and Entrepreneurship, IIT Jodhpur</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
