import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, ArrowRight, GraduationCap, Briefcase, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AssessmentRecommendationQuiz } from "@/components/AssessmentRecommendationQuiz";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />

      {/* Assessment Recommendation Quiz */}
      <AssessmentRecommendationQuiz open={showQuiz} onClose={() => setShowQuiz(false)} />

      <main>
        {/* Hero Section */}
        <section className="container py-20 text-center max-w-5xl px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            Measure Your AI Intelligence with the AIQ Assessment
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
            The AIQ assessment is a <strong>research-validated evaluation</strong> of your ability to collaborate
            effectively with artificial intelligence. Measure and develop your <strong>AI collaboration skills</strong>{' '}
            across 8 key dimensions with personalized insights backed by <strong>peer-reviewed methodology</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
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

        {/* Why It Matters - Slim Stats Bar */}
        <section className="bg-secondary/30 py-8 md:py-12">
          <div className="container max-w-6xl px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-blue-900 mb-2">78%</div>
                <p className="text-sm text-muted-foreground mb-1">
                  of organizations now use AI in at least one function
                </p>
                <p className="text-xs text-muted-foreground/70">Stanford HAI AI Index 2025</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-blue-900 mb-2">55%</div>
                <p className="text-sm text-muted-foreground mb-1">
                  of companies lack resources to train employees on AI
                </p>
                <p className="text-xs text-muted-foreground/70">Express Employment 2025</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-blue-900 mb-2">$13T</div>
                <p className="text-sm text-muted-foreground mb-1">potential AI economic value by 2030</p>
                <p className="text-xs text-muted-foreground/70">McKinsey Global Institute</p>
              </div>
            </div>
          </div>
        </section>

        {/* Help Me Choose - Prominent Section */}
        <section className="container py-16 max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Not Sure Which Assessment to Take?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Answer a few quick questions and we'll recommend the perfect assessment track for your experience level and
            goals
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => setShowQuiz(true)}
            className="bg-blue-900 hover:bg-blue-800 font-semibold text-base px-8 py-6"
          >
            <Sparkles className="mr-2 w-5 h-5" />
            Help Me Choose the Right Assessment
          </Button>
        </section>

        {/* Choose Your Assessment Track */}
        <section className="container py-16 max-w-6xl">
          <h2 className="text-4xl font-extrabold text-center mb-3 tracking-tight">Choose Your Assessment Track</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Select the track that best matches your background and goals
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* General Track */}
            <Card className="hover:shadow-lg transition-all border-2">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/10 rounded-full mb-4">
                  <Brain className="h-8 w-8 text-blue-900" />
                </div>
                <h3 className="text-2xl font-bold mb-2">General</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Universal AI assessment for all backgrounds and experience levels
                </p>
                <Link to="/assessments/general">
                  <Button size="lg" className="w-full bg-blue-900 hover:bg-blue-800">
                    Explore General Track
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Student Track */}
            <Card className="hover:shadow-lg transition-all border-2">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/10 rounded-full mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-900" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Students</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Age-appropriate AI assessment designed for students aged 14-17
                </p>
                <Link to="/assessments/student">
                  <Button size="lg" className="w-full bg-blue-900 hover:bg-blue-800">
                    Explore Student Track
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Track */}
            <Card className="hover:shadow-lg transition-all border-2">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/10 rounded-full mb-4">
                  <Briefcase className="h-8 w-8 text-blue-900" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Professionals</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Role-specific AI assessments across 15 specialized careers
                </p>
                <Link to="/assessments/professional">
                  <Button size="lg" className="w-full bg-blue-900 hover:bg-blue-800">
                    Explore Professional Roles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Brief Value Propositions */}
        <section className="bg-secondary/30 py-16">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-extrabold mb-8 tracking-tight">Why Take the AIQ Assessment?</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl mb-3">🔬</div>
                <h3 className="font-bold mb-2">Research-Validated</h3>
                <p className="text-sm text-muted-foreground">
                  Peer-reviewed methodology published in academic journals
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold mb-2">8 Dimensions</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive evaluation across all AI collaboration skills
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold mb-2">Shareable Certificate</h3>
                <p className="text-sm text-muted-foreground">
                  Verifiable credential for LinkedIn and your professional portfolio
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link to="/features">
                <Button variant="outline" size="lg">
                  Explore All Features
                </Button>
              </Link>
              <Link to="/research">
                <Button variant="outline" size="lg">
                  View Research Details
                </Button>
              </Link>
            </div>
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
                Assessment duration varies by track: General Track assessments are 60 minutes (Beginner) or 80 minutes
                (Advanced), Student Track assessments are 24 minutes (Ages 14-15) or 48 minutes (Ages 16-17), and
                Professional Track assessments follow the same 60/80 minute structure as General Track based on the
                level you choose.
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
            <AccordionItem value="item-5">
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
