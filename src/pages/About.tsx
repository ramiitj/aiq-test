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
    { icon: Target, name: "Strategic AI Understanding", description: "Align AI capabilities with business objectives" },
    { icon: Lightbulb, name: "Prompt Engineering", description: "Design effective prompts for optimal AI responses" },
    { icon: Brain, name: "Critical Evaluation", description: "Assess AI output quality and identify limitations" },
    { icon: Shield, name: "Ethical Judgment", description: "Navigate AI ethics and responsible use" },
    { icon: Zap, name: "Integration Intelligence", description: "Blend AI capabilities with human expertise" },
    { icon: Users, name: "Adaptive Learning", description: "Refine collaboration strategies over time" },
    { icon: TrendingUp, name: "Context Sensitivity", description: "Adapt AI use to different situations" },
    { icon: Sparkles, name: "Creative Synthesis", description: "Leverage AI for innovation and problem-solving" },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} isAdmin={isAdmin} />

      <main className="container py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            About the AIQ Framework
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A scientifically validated framework for measuring human-AI collaboration capabilities
          </p>
        </div>

        {/* The Problem We're Solving */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">The Skills Gap in the AI Era</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Organizations are adopting AI rapidly, but lack tools to measure who can actually use it effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-red-600 mb-2">No Standard</div>
                <p className="text-sm text-muted-foreground">
                  Until now, no validated assessment existed for AI collaboration skills
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-orange-600 mb-2">65%</div>
                <p className="text-sm text-muted-foreground">of employees receive no formal AI literacy training</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <TrendingUp className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-yellow-600 mb-2">$16T</div>
                <p className="text-sm text-muted-foreground">potential value at stake if we bridge the AI skills gap</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What We Measure: 8 Dimensions */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">The 8 Dimensions of AI Collaboration</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our framework measures the complete spectrum of skills needed to work effectively with AI systems
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <Card key={index} className="shadow-sm border text-center hover:shadow-md transition-shadow">
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

        {/* Our Methodology */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">Rigorous Scientific Methodology</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on established psychometric principles, not opinion or guesswork
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
                      We use IRT, the gold standard in adaptive testing used by GRE, SAT, and professional certification
                      exams worldwide.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Questions dynamically adapt to your ability level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Precise measurement across all skill ranges</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>400+ calibrated performance-based items</span>
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
                    <h3 className="font-bold text-lg mb-2">Peer-Reviewed Research</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Developed through rigorous academic research at IIT Jodhpur and published in leading journals.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Published in Discover Artificial Intelligence (Springer Nature)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Comprehensive literature review and validation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Pilot tested with diverse populations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance-Based Assessment */}
        <div className="mb-16">
          <Card className="shadow-xl border-2 border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
            <CardContent className="pt-10 pb-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold mb-3">Real Skills, Not Surveys</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Unlike opinion-based questionnaires, our assessment measures actual performance through practical
                  tasks
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-blue-900 rounded-full w-fit mx-auto mb-3">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Task-Based</h3>
                  <p className="text-sm text-muted-foreground">
                    Demonstrate real skills through authentic scenarios, not self-reported opinions
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-green-600 rounded-full w-fit mx-auto mb-3">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Adaptive</h3>
                  <p className="text-sm text-muted-foreground">
                    Questions adjust in real-time to provide precise measurement at any skill level
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 bg-purple-600 rounded-full w-fit mx-auto mb-3">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Validated</h3>
                  <p className="text-sm text-muted-foreground">
                    Backed by rigorous psychometric analysis and peer-reviewed research
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Who Benefits */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">Applications Across Sectors</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From hiring decisions to curriculum design, AIQ provides actionable insights
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
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                    <span>Identify high-potential AI collaborators for strategic roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                    <span>Design targeted upskilling programs based on data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                    <span>Make evidence-based hiring and promotion decisions</span>
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
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></div>
                    <span>Measure student AI literacy with validated metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></div>
                    <span>Build curricula around demonstrable competencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></div>
                    <span>Track student progress with pre and post assessments</span>
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
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></div>
                    <span>Credential your AI collaboration skills objectively</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></div>
                    <span>Identify personal development priorities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0"></div>
                    <span>Differentiate yourself in competitive job markets</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Research Team */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">The Research Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Faculty researchers at the Indian Institute of Technology Jodhpur
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-xl mb-1">Venkat Ram Reddy Ganuthula, Ph.D.</h3>
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  Assistant Professor, School of Management and Entrepreneurship
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Specializes in behavioral science, judgment and decision-making, and the intersection of AI and human
                  behavior.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Contact:</span> ram@iitj.ac.in
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
                  Brings 20+ years of technology leadership experience. Research focuses on strategic foresight and AI
                  governance.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Contact:</span> krishna@iitj.ac.in
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA - Read the Research */}
        <Card className="shadow-xl border-2 border-blue-900 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
          <CardContent className="pt-10 pb-10">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-3">Explore the Research</h2>
              <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                Read the complete peer-reviewed study in Discover Artificial Intelligence
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 max-w-3xl mx-auto text-left">
                <p className="text-sm font-semibold mb-2">Citation:</p>
                <p className="text-sm leading-relaxed mb-2">
                  Ganuthula, V.R.R., Balaraman, K.K. (2025). Artificial intelligence quotient framework for measuring
                  human collaboration with artificial intelligence.{" "}
                  <span className="italic">Discover Artificial Intelligence, 5</span>, 268.
                </p>
                <p className="text-xs font-mono opacity-75 mt-2">https://doi.org/10.1007/s44163-025-00516-1</p>
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
