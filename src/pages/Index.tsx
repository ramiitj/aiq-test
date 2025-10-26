import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, Zap, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const features = [
    {
      icon: Brain,
      title: "Research-Based Framework",
      description: "Built on peer-reviewed research from IIT Jodhpur scholars, measuring 8 critical dimensions of AI collaboration."
    },
    {
      icon: Target,
      title: "Adaptive Assessment",
      description: "Uses Item Response Theory (IRT) to dynamically adjust question difficulty based on your performance."
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Receive comprehensive scoring with dimension breakdowns and personalized improvement recommendations."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your test data is encrypted and private. Share results only when you choose to."
    }
  ];

  const benefits = [
    "Understand your AI collaboration strengths and weaknesses",
    "Benchmark your skills against standardized metrics",
    "Receive actionable insights for improvement",
    "Share verified results with employers or educators",
    "Track your progress over time"
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <main>
        {/* Hero Section */}
        <section className="container py-20 text-center max-w-5xl">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Measure Your <span className="text-primary">AI Collaboration</span> Intelligence
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Take the research-validated Artificial Intelligence Quotient (AIQ) test to assess 
            your ability to collaborate effectively with AI systems across 8 key dimensions.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary/30 py-20">
          <div className="container max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Take the AIQ Test?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="shadow-elegant">
                    <CardContent className="pt-6 text-center">
                      <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container py-20 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                What You'll Gain
              </h2>
              <p className="text-muted-foreground mb-6">
                The AIQ test provides comprehensive insights into your AI collaboration 
                capabilities, helping you understand where you excel and where you can improve.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="shadow-elegant">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Assessment Format</h3>
                    <p className="text-sm text-muted-foreground">
                      60-minute adaptive test covering 8 dimensions with 80 performance-based questions
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Scoring System</h3>
                    <p className="text-sm text-muted-foreground">
                      Each response scored 0-100 using research-validated rubrics with detailed feedback
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Results Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Instant comprehensive report with dimension breakdowns and improvement suggestions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-20">
          <div className="container text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Discover Your AIQ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join professionals and students worldwide in measuring and improving their 
              AI collaboration capabilities.
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Start Your Test
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Sign Up Now
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Based on research by Venkat Ram Reddy Ganuthula and Krishna Kumar Balaraman
          </p>
          <p className="mt-2">
            School of Management and Entrepreneurship, IIT Jodhpur
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
