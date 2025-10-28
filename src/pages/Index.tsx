import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Zap, Shield, CheckCircle } from "lucide-react";
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
      data: {
        session
      }
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };
  const features = [{
    icon: "logo",
    title: "Research-Based Framework",
    description: "Built on peer-reviewed research measuring 8 critical dimensions of AI collaboration."
  }, {
    icon: Target,
    title: "Adaptive Assessment",
    description: "Uses Item Response Theory (IRT) to dynamically adjust question difficulty based on your performance."
  }, {
    icon: Zap,
    title: "Instant Results",
    description: "Receive comprehensive scoring with dimension breakdowns and personalized improvement recommendations."
  }, {
    icon: Shield,
    title: "Secure & Private",
    description: "Your test data is encrypted and private. Share results only when you choose to."
  }];
  const benefits = ["Understand your AI collaboration strengths and weaknesses", "Benchmark your skills against standardized metrics", "Receive actionable insights for improvement", "Share verified results with employers or educators", "Track your progress over time"];
  return <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <main>
        {/* Hero Section */}
        <section className="container py-20 text-center max-w-5xl">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
            <img src={aiqBrainLogo} alt="AIQ Logo" className="h-12 w-12" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-[1.1]">
            The World's First Comprehensive <span className="text-blue-900">AI Quotient</span> Assessment
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Measure your AI collaboration intelligence through the world's most comprehensive research-based assessment. 
            Backed by rigorous peer-reviewed academic research with 400+ calibrated items and validated 
            across 8 critical dimensions of AI competency.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 bg-blue-900 hover:bg-blue-800">
                  Go to Dashboard
                </Button>
              </Link> : <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Take the Test
                </Button>
              </Link>}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16 tracking-tight">
              The World's Most Comprehensive AI Quotient Assessment
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
              const Icon = feature.icon === "logo" ? null : feature.icon;
              return <Card key={index} className="shadow-elegant">
                    <CardContent className="pt-6 text-center">
                      <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                        {Icon ? <Icon className="h-6 w-6 text-primary" /> : <img src={aiqBrainLogo} alt="AIQ Logo" className="h-6 w-6" />}
                      </div>
                      <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </div>
        </section>

        {/* Research Validation Section */}
        <section className="container py-20 max-w-6xl">
          <div className="bg-card rounded-lg p-8 border shadow-elegant">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-8 tracking-tight">
              Backed by Rigorous Academic Research
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">400+</div>
                <p className="text-muted-foreground">Calibrated Assessment Items</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">8</div>
                <p className="text-muted-foreground">Validated AI Competency Dimensions</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">IRT</div>
                <p className="text-muted-foreground">Item Response Theory Methodology</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">Peer-Reviewed</div>
                <p className="text-muted-foreground">Academic Research Foundation</p>
              </div>
            </div>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our assessment is built on peer-reviewed research with psychometric validation, ensuring accurate 
              and reliable measurement of your AI collaboration capabilities across all proficiency levels.
            </p>
          </div>
        </section>

        {/* Test Variations Section */}
        <section className="container py-20 max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-6 tracking-tight">
            Choose Your Assessment Level
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto leading-relaxed">
            Select the assessment that matches your AI experience level
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-elegant">
              <CardContent className="pt-6">
                <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-4">
                  Beginner
                </div>
                <h3 className="text-2xl font-bold mb-3">Foundational</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  For those new to AI and looking to build foundational literacy
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>24 questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>15 minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>8 core dimensions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Basic difficulty levels</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Ideal for: Students, beginners, and AI newcomers
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-primary border-2">
              <CardContent className="pt-6">
                <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-4">
                  Professional
                </div>
                <h3 className="text-2xl font-bold mb-3">Comprehensive</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  For professionals actively using AI in their work
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>80 questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>60 minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>8 core dimensions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Multi-level difficulty</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Ideal for: AI practitioners and active users
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="pt-6">
                <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-4">
                  Expert
                </div>
                <h3 className="text-2xl font-bold mb-3">Advanced</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  For AI experts, leaders, and advanced practitioners
                </p>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>80 questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>60 minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>8 core dimensions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span>Advanced difficulty</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Ideal for: AI leaders, researchers, and experts
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container py-20 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                What You'll Gain
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The AIQ test provides comprehensive insights into your AI collaboration 
                capabilities, helping you understand where you excel and where you can improve.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-base leading-relaxed">{benefit}</span>
                  </li>)}
              </ul>
            </div>
            <Card className="shadow-elegant">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Assessment Format</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      60-minute adaptive test covering 8 dimensions with 80 performance-based questions
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Scoring System</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Each response scored 0-100 using research-validated rubrics with detailed feedback
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Results Delivery</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
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
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              Ready to Discover Your AIQ?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Join professionals and students worldwide in measuring and improving their 
              AI collaboration capabilities.
            </p>
            {isAuthenticated ? <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Take the Test
                </Button>
              </Link> : <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Take the Test
                </Button>
              </Link>}
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
    </div>;
};
export default Index;