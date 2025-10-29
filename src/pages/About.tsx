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
  FileText,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Sparkles,
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
    {
      icon: Target,
      name: "Strategic AI Understanding",
      description: "Map AI capabilities to business objectives and understand opportunities and limitations.",
    },
    {
      icon: Lightbulb,
      name: "Prompt Engineering",
      description: "Craft effective prompts to elicit optimal AI responses.",
    },
    {
      icon: Brain,
      name: "Critical Evaluation",
      description: "Assess AI outputs for accuracy and detect biases.",
    },
    {
      icon: Zap,
      name: "Integration Intelligence",
      description: "Combine AI with human expertise effectively.",
    },
    {
      icon: Users,
      name: "Adaptive Learning",
      description: "Learn from AI interactions and refine strategies.",
    },
    {
      icon: Shield,
      name: "Ethical Judgment",
      description: "Make responsible decisions about AI use.",
    },
    {
      icon: TrendingUp,
      name: "Context Sensitivity",
      description: "Adapt AI approaches to varied situations.",
    },
    {
      icon: Sparkles,
      name: "Creative Synthesis",
      description: "Leverage AI for innovative problem-solving.",
    },
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} isAdmin={isAdmin} />

      <main className="container py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            About AIQ Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A research-based framework for measuring human-AI collaboration in the age of cognitive augmentation
          </p>
        </div>

        {/* Research Paper Highlight - Hero CTA */}
        <Card className="mb-16 shadow-xl border-2 border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
          <CardContent className="pt-10 pb-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-6 w-6 text-blue-900" />
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Published Research</span>
                </div>
                <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Peer-Reviewed Academic Framework</h2>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Published in <span className="font-bold">Discover Artificial Intelligence</span> (Springer Nature,
                  2025). Our research addresses the critical gap in standardized, performance-based assessment tools for
                  measuring human-AI collaboration competencies.
                </p>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg mb-4 border">
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    "Artificial intelligence quotient framework for measuring human collaboration with artificial
                    intelligence" by Ganuthula & Balaraman
                  </p>
                  <p className="text-xs text-blue-900 font-mono mt-2">DOI: 10.1007/s44163-025-00516-1</p>
                </div>
                <a
                  href="https://link.springer.com/epdf/10.1007/s44163-025-00516-1?sharing_token=T6xe9nZzrWS-C-ANGiDQV_e4RwlQNchNByi7wbcMAY6YdayLiwdIOdDO4XNZbgLvZSQyi_Fj10NE-qC63u4Uuk-HXsnEOE776OwTqhqvFbE7eSi796eIPBck33pH9cCkWzgkpfBXUyX1LgBPrj5DS1iggJOQ9h91dxbrHABq1wk%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-blue-900 hover:bg-blue-800 font-semibold">
                    Read Full Paper <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
              <div className="relative">
                <div className="aspect-[3/4] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-blue-900 overflow-hidden">
                  <a
                    href="https://link.springer.com/epdf/10.1007/s44163-025-00516-1?sharing_token=T6xe9nZzrWS-C-ANGiDQV_e4RwlQNchNByi7wbcMAY6YdayLiwdIOdDO4XNZbgLvZSQyi_Fj10NE-qC63u4Uuk-HXsnEOE776OwTqhqvFbE7eSi796eIPBck33pH9cCkWzgkpfBXUyX1LgBPrj5DS1iggJOQ9h91dxbrHABq1wk%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full hover:opacity-90 transition-opacity relative group"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/90 to-blue-600/90 text-white p-8">
                      <div className="text-center">
                        <FileText className="h-20 w-20 mx-auto mb-4 opacity-80" />
                        <p className="font-bold text-lg mb-2">Research Paper</p>
                        <p className="text-sm opacity-90">Click to view full text</p>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                          Open PDF <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Research Insights */}
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold mb-3 text-center">Key Research Insights</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Findings from our peer-reviewed research on AI collaboration competencies
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-extrabold text-blue-900 mb-2">0/16</div>
                  <p className="text-xs font-semibold text-muted-foreground">Existing AI Literacy Scales</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  showed positive evidence for all psychometric properties - highlighting the critical need for
                  validated assessment tools
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-extrabold text-green-700 mb-2">8</div>
                  <p className="text-xs font-semibold text-muted-foreground">Core Dimensions Identified</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  through comprehensive literature review spanning cognitive science, HCI research, and organizational
                  behavior studies
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-purple-50 dark:bg-purple-950/20">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-extrabold text-purple-700 mb-2">IRT</div>
                  <p className="text-xs font-semibold text-muted-foreground">Adaptive Methodology</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  Item Response Theory enables precise measurement across all proficiency levels, from novice to expert
                  practitioners
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Research Findings - What We Discovered */}
        <Card className="mb-16 shadow-sm border">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-extrabold mb-6 text-center">What Makes AIQ Different</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-bold text-lg">Traditional Approaches</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-red-600 font-bold mt-0.5">×</span>
                    <div>
                      <span className="font-semibold">Self-reported measures:</span>
                      <span className="text-muted-foreground ml-1">Lack objective performance validation</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-red-600 font-bold mt-0.5">×</span>
                    <div>
                      <span className="font-semibold">Limited scope:</span>
                      <span className="text-muted-foreground ml-1">Focus on isolated technical skills only</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-red-600 font-bold mt-0.5">×</span>
                    <div>
                      <span className="font-semibold">Static testing:</span>
                      <span className="text-muted-foreground ml-1">Same questions for all proficiency levels</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-red-600 font-bold mt-0.5">×</span>
                    <div>
                      <span className="font-semibold">Poor validation:</span>
                      <span className="text-muted-foreground ml-1">No rigorous psychometric testing</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg">AIQ Framework</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <div>
                      <span className="font-semibold">Performance-based:</span>
                      <span className="text-muted-foreground ml-1">
                        Real-world task scenarios with observable outcomes
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <div>
                      <span className="font-semibold">Holistic assessment:</span>
                      <span className="text-muted-foreground ml-1">Measures collaborative intelligence ecosystem</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <div>
                      <span className="font-semibold">Adaptive IRT:</span>
                      <span className="text-muted-foreground ml-1">Dynamically adjusts difficulty for precision</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <div>
                      <span className="font-semibold">Peer-reviewed:</span>
                      <span className="text-muted-foreground ml-1">Rigorous validation through academic research</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* The 8 Dimensions - Visual Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold mb-3 text-center">The 8 AIQ Dimensions</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Comprehensive cognitive ecosystem for measuring human-AI collaboration
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <Card
                  key={index}
                  className="shadow-sm hover:shadow-lg transition-all hover:scale-105 border text-center"
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="p-3 bg-blue-900/10 rounded-full w-fit mx-auto mb-3">
                      <Icon className="h-6 w-6 text-blue-900" />
                    </div>
                    <h3 className="text-sm font-bold mb-2">{dimension.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{dimension.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Methodology - Visual Cards */}
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold mb-10 text-center">Assessment Methodology</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="p-4 bg-blue-900 rounded-full w-fit mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Item Response Theory</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Adaptive testing that adjusts difficulty based on performance for accurate measurement at all skill
                  levels
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="p-4 bg-green-600 rounded-full w-fit mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Performance-Based</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-world scenarios requiring practical demonstration of AI collaboration skills
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-purple-50 dark:bg-purple-950/20">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="p-4 bg-purple-600 rounded-full w-fit mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Research-Validated</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Standardized rubrics developed through rigorous psychometric validation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Applications - Icon Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold mb-10 text-center">Real-World Applications</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-bold text-lg mb-3">Education</h3>
                <ul className="space-y-2 text-sm text-muted-foreground text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-600"></div>
                    Curriculum design
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-600"></div>
                    Student assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-600"></div>
                    AI literacy programs
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg mb-3">Organizations</h3>
                <ul className="space-y-2 text-sm text-muted-foreground text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Workforce planning
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Talent development
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Strategic implementation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-lg mb-3">Professionals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    Career planning
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    Skill development
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                    Competency certification
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Research Team - Compact Cards */}
        <div className="mb-16">
          <h2 className="text-4xl font-extrabold mb-10 text-center">Research Team</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-xl mb-1">Venkat Ram Reddy Ganuthula, Ph.D.</h3>
                <p className="text-xs text-blue-900 font-semibold mb-3">Assistant Professor, IIT Jodhpur</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Specializes in Human Capital and Organizational Dynamics with focus on behavioral science, judgment
                  and decision-making, and AI's implications.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Contact:</span> ram@iitj.ac.in
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-xl mb-1">Krishna Kumar Balaraman, Ph.D.</h3>
                <p className="text-xs text-blue-900 font-semibold mb-3">Associate Professor, IIT Jodhpur</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Expert in Strategic and Public Policy with 20+ years in advanced technologies leadership. Research in
                  strategic foresight, AI strategies, and governance.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Contact:</span> krishna@iitj.ac.in
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA - Read the Full Paper */}
        <Card className="shadow-xl border-2 border-blue-900 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
          <CardContent className="pt-10 pb-10 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-extrabold mb-3">Read the Complete Research</h2>
            <p className="text-base opacity-90 mb-6 max-w-2xl mx-auto">
              Dive deep into the methodology, validation studies, and comprehensive framework behind the AIQ assessment
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 max-w-3xl mx-auto">
              <p className="text-sm leading-relaxed mb-2">
                <span className="font-bold">Citation:</span> Ganuthula, V.R.R., Balaraman, K.K. (2025). Artificial
                intelligence quotient framework for measuring human collaboration with artificial intelligence.
                <span className="italic"> Discover Artificial Intelligence</span>, 5, 268.
              </p>
              <p className="text-xs font-mono opacity-75">DOI: 10.1007/s44163-025-00516-1</p>
            </div>
            <a
              href="https://link.springer.com/epdf/10.1007/s44163-025-00516-1?sharing_token=T6xe9nZzrWS-C-ANGiDQV_e4RwlQNchNByi7wbcMAY6YdayLiwdIOdDO4XNZbgLvZSQyi_Fj10NE-qC63u4Uuk-HXsnEOE776OwTqhqvFbE7eSi796eIPBck33pH9cCkWzgkpfBXUyX1LgBPrj5DS1iggJOQ9h91dxbrHABq1wk%3D"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-white text-blue-900 hover:bg-gray-100 font-semibold text-base px-8 py-6 shadow-xl"
              >
                Access Full Paper <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
