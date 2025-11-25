import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Research = () => {
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

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <main>
        {/* Hero Section */}
        <section className="container py-20 text-center max-w-5xl">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight leading-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            Research Foundation
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            The AIQ assessment is built on rigorous academic research and validated through peer-reviewed methodology
          </p>
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

        {/* Methodology Section */}
        <section className="bg-secondary/30 py-16">
          <div className="container max-w-5xl">
            <h2 className="text-4xl font-extrabold text-center mb-4 tracking-tight">
              Scientific Methodology
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Our assessment uses the same rigorous psychometric approach as standardized tests like the GRE and SAT
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-sm border-2">
                <CardHeader>
                  <h3 className="text-xl font-bold">Item Response Theory</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    IRT is a state-of-the-art psychometric framework that calibrates each question's difficulty and discrimination. 
                    This allows for precise measurement of abilities and adaptive testing that adjusts to your skill level.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-2">
                <CardHeader>
                  <h3 className="text-xl font-bold">Peer-Reviewed Publication</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Published in Discover Artificial Intelligence (Springer Nature, 2025), our methodology has undergone 
                    rigorous academic review to ensure validity, reliability, and scientific credibility.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-2">
                <CardHeader>
                  <h3 className="text-xl font-bold">Multi-Track Validation</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    With 400+ calibrated items across general, student, and professional tracks, our assessment covers 
                    diverse populations and experience levels with role-specific evaluation frameworks.
                  </p>
                </CardContent>
              </Card>
            </div>
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

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16">
          <div className="container text-center max-w-3xl">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
              Validate Your AI Skills
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Research;
