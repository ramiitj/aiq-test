import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Target,
  Lightbulb,
  Shield,
  Users,
  Zap,
  BookOpen,
  Award,
  ExternalLink,
  TrendingUp,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkUserRole } from "@/lib/roleUtils";

const About = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);

    if (session) {
      const adminStatus = await checkUserRole(session.user.id);
      setIsAdmin(adminStatus);
    }
  };

  const dimensions = [
    { icon: Target, name: "Strategic AI Understanding", description: "Map AI capabilities to business objectives" },
    { icon: Lightbulb, name: "Prompt Engineering", description: "Craft effective prompts for optimal responses" },
    { icon: Brain, name: "Critical Evaluation", description: "Assess accuracy and detect biases" },
    { icon: Zap, name: "Integration Intelligence", description: "Combine AI with human expertise" },
    { icon: Users, name: "Adaptive Learning", description: "Learn and refine collaboration strategies" },
    { icon: Shield, name: "Ethical Judgment", description: "Make responsible AI decisions" },
    { icon: TrendingUp, name: "Context Sensitivity", description: "Adapt approaches to varied situations" },
    { icon: Sparkles, name: "Creative Synthesis", description: "Leverage AI for innovation" },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} isAdmin={isAdmin} />

      <main className="container py-12 max-w-6xl">
        {/* Hero - Clear Purpose */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            About AIQ Assessment
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The first scientifically validated framework for measuring how effectively humans collaborate with AI
          </p>
        </div>

        {/* 1. THE PROBLEM */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">The Challenge We're Solving</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI is everywhere, but we have no way to measure who can use it effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-red-600 mb-2">Gap</div>
                <p className="text-sm text-muted-foreground">
                  No validated tools exist to measure AI collaboration skills
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-orange-600 mb-2">65%</div>
                <p className="text-sm text-muted-foreground">of employees lack any AI literacy training</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <TrendingUp className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-yellow-600 mb-2">$16T</div>
                <p className="text-sm text-muted-foreground">
                  potential economic impact if we get AI collaboration right
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 2. OUR SOLUTION */}
        <div className="mb-16">
          <Card className="shadow-xl border-2 border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
            <CardContent className="pt-10 pb-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold mb-3">Our Solution: The AIQ Framework</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  A rigorous, research-backed assessment that actually measures real-world AI collaboration skills
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-blue-900 rounded-full w-fit mx-auto mb-3">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Performance-Based</h3>
                  <p className="text-sm text-muted-foreground">
                    Real tasks, not just surveys. You demonstrate actual skills.
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-green-600 rounded-full w-fit mx-auto mb-3">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Scientifically Validated</h3>
                  <p className="text-sm text-muted-foreground">
                    Peer-reviewed research published in academic journals.
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-purple-600 rounded-full w-fit mx-auto mb-3">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Adaptive Testing</h3>
                  <p className="text-sm text-muted-foreground">
                    Questions adjust to your level for precise measurement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. WHAT WE MEASURE */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">What We Measure: 8 Core Dimensions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These skills form the complete picture of human-AI collaboration capability
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <Card key={index} className="shadow-sm border text-center">
                  <CardContent className="pt-6 pb-6">
                    <div className="p-3 bg-blue-900/10 rounded-full w-fit mx-auto mb-3">
                      <Icon className="h-6 w-6 text-blue-900" />
                    </div>
                    <h3 className="text-sm font-bold mb-2">{dimension.name}</h3>
                    <p className="text-xs text-muted-foreground">{dimension.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 4. HOW IT WORKS */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">How It Works: Our Methodology</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on proven psychometric science, not guesswork
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Item Response Theory (IRT)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      The gold standard in testing. Same methodology used in GRE, SAT, and medical board exams.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Questions adapt to your skill level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Accurate for beginners and experts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>400+ calibrated questions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Research Validation</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Developed at IIT Jodhpur and published in peer-reviewed journals.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Published in Discover AI (Springer)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Comprehensive literature review</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Pilot tested and refined</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 5. WHO BENEFITS */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">Who Benefits from AIQ</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Organizations, educators, and professionals measuring AI collaboration skills
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border">
              <CardContent className="pt-8 pb-8">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-center">Organizations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></div>
                    <span>Identify high-potential AI collaborators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></div>
                    <span>Design targeted training programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></div>
                    <span>Make data-driven hiring decisions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-8 pb-8">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-center">Educators</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5"></div>
                    <span>Assess student AI literacy objectively</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5"></div>
                    <span>Design curriculum around real skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5"></div>
                    <span>Track learning progress over time</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-8 pb-8">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto mb-4">
                  <Award className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-center">Professionals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5"></div>
                    <span>Demonstrate skills to employers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5"></div>
                    <span>Identify areas for improvement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5"></div>
                    <span>Stand out in competitive markets</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 6. RESEARCH TEAM */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">The Research Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Developed by leading researchers at IIT Jodhpur</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-xl mb-1">Venkat Ram Reddy Ganuthula, Ph.D.</h3>
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  Assistant Professor, School of Management and Entrepreneurship
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Expert in behavioral science, judgment and decision-making, and AI's impact on human behavior.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Email:</span> ram@iitj.ac.in
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-xl mb-1">Krishna Kumar Balaraman, Ph.D.</h3>
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  Associate Professor, School of Management and Entrepreneurship
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  20+ years in technology leadership. Specializes in strategic foresight and AI governance.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Email:</span> krishna@iitj.ac.in
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 7. FINAL CTA - Read the Research */}
        <Card className="shadow-xl border-2 border-blue-900 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
          <CardContent className="pt-10 pb-10">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-3">Want to Learn More?</h2>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Read our complete peer-reviewed research paper published in Discover Artificial Intelligence
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 max-w-3xl mx-auto text-left">
                <p className="text-sm font-semibold mb-2">Published Research:</p>
                <p className="text-sm leading-relaxed mb-2 italic">
                  "Artificial intelligence quotient framework for measuring human collaboration with artificial
                  intelligence"
                </p>
                <p className="text-sm opacity-90">
                  Ganuthula, V.R.R., Balaraman, K.K. (2025). Discover Artificial Intelligence, 5, 268.
                </p>
                <p className="text-xs font-mono opacity-75 mt-2">DOI: 10.1007/s44163-025-00516-1</p>
              </div>

              <a
                href="https://link.springer.com/epdf/10.1007/s44163-025-00516-1?sharing_token=T6xe9nZzrWS-C-ANGiDQV_e4RwlQNchNByi7wbcMAY6YdayLiwdIOdDO4XNZbgLvZSQyi_Fj10NE-qC63u4Uuk-HXsnEOE776OwTqhqvFbE7eSi796eIPBck33pH9cCkWzgkpfBXUyX1LgBPrj5DS1iggJOQ9h91dxbrHABq1wk%3D"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-gray-100 font-semibold text-lg px-10 py-6 shadow-xl"
                >
                  Read Full Paper <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
