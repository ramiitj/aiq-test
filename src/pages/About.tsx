import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, Lightbulb, Shield, Users, Zap, BookOpen, Award } from "lucide-react";
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
    const { data: { session } } = await supabase.auth.getSession();
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
      description: "Map AI capabilities to business objectives and understand both opportunities and limitations in real-world contexts."
    },
    {
      icon: Lightbulb,
      name: "Prompt Engineering Intelligence",
      description: "Craft effective prompts with linguistic specificity and strategic reasoning to elicit optimal AI responses."
    },
    {
      icon: Brain,
      name: "Critical Evaluation Capability",
      description: "Assess AI outputs for accuracy, detect biases, and determine reliability within specific contexts."
    },
    {
      icon: Zap,
      name: "Integration Intelligence",
      description: "Seamlessly combine AI capabilities with human expertise to create solutions superior to either alone."
    },
    {
      icon: Users,
      name: "Adaptive Learning Capability",
      description: "Learn from AI interactions and continuously refine collaboration strategies over time."
    },
    {
      icon: Shield,
      name: "Ethical Judgment in AI Utilization",
      description: "Make responsible decisions about AI use, considering privacy, bias, fairness, and societal impact."
    },
    {
      icon: Brain,
      name: "Context Sensitivity",
      description: "Adapt AI approaches to varied organizational, cultural, and situational demands effectively."
    },
    {
      icon: Lightbulb,
      name: "Creative Synthesis",
      description: "Leverage AI as a catalyst for innovative thinking and creative problem-solving."
    }
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
      
      <main className="container py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            About AIQ Assessment
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-medium">
            A research-based framework for measuring human-AI collaboration capabilities in the age of cognitive augmentation
          </p>
        </div>

        {/* The Challenge */}
        <Card className="mb-10 shadow-sm border">
          <CardContent className="pt-6 pb-6">
            <div className="flex gap-3 items-start mb-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-2">Why AIQ Matters</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Traditional intelligence tests and digital literacy measures fail to capture the unique cognitive requirements 
                  of the AI era. As AI becomes ubiquitous in professional and educational settings, the ability to effectively 
                  collaborate with these systems is now as critical as any technical skill.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <div className="text-2xl font-black text-primary mb-1">30%</div>
                    <p className="text-xs text-muted-foreground">of adults can accurately describe common AI uses</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <div className="text-2xl font-black text-primary mb-1">38%</div>
                    <p className="text-xs text-muted-foreground">report more fear than excitement about AI</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <div className="text-2xl font-black text-primary mb-1">0/16</div>
                    <p className="text-xs text-muted-foreground">AI literacy scales showed positive evidence for all properties</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Foundation */}
        <Card className="mb-10 shadow-sm border">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-2xl font-black mb-3">Research Foundation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The AIQ framework addresses a critical gap identified in peer-reviewed research: the absence of standardized, 
              performance-based assessment tools for measuring human-AI collaboration competencies. Unlike existing AI literacy 
              scales that rely on self-reporting and lack validation, AIQ uses rigorous psychometric methods grounded in 
              cognitive science and human-computer interaction research.
            </p>
            <div className="bg-secondary/20 p-5 rounded-lg">
              <p className="text-sm leading-relaxed font-medium mb-2">
                Published in <span className="font-bold">Discover Artificial Intelligence</span> (2025)
              </p>
              <p className="text-xs text-muted-foreground italic">
                "Artificial intelligence quotient framework for measuring human collaboration with artificial intelligence" 
                by Ganuthula & Balaraman. DOI: 10.1007/s44163-025-00516-1
              </p>
            </div>
          </CardContent>
        </Card>

        {/* The 8 Dimensions */}
        <div className="mb-10">
          <h2 className="text-2xl font-black mb-2 text-center">The 8 AIQ Dimensions</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
            These interconnected dimensions form a comprehensive cognitive ecosystem for measuring human-AI collaboration
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex gap-3 items-start">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold mb-1">{dimension.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {dimension.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Assessment Methodology */}
        <Card className="mb-10 shadow-sm border">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-2xl font-black mb-4">Assessment Methodology</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg h-fit">
                  <Award className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Item Response Theory (IRT)</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The assessment uses adaptive testing principles to dynamically adjust question difficulty based on 
                    performance, ensuring accurate measurement across all skill levels from novice to expert.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit">
                  <Target className="h-4 w-4 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Performance-Based Tasks</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Rather than multiple-choice questions, AIQ uses real-world scenarios requiring practical demonstration 
                    of AI collaboration skills, such as crafting effective prompts or identifying biases in AI outputs.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg h-fit">
                  <Brain className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Research-Validated Scoring</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Each response is evaluated using standardized rubrics (0-100 scale) developed through rigorous 
                    psychometric validation, with scoring criteria that emphasize observable behaviors and outcomes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Makes AIQ Different */}
        <Card className="mb-10 shadow-sm border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-2xl font-black mb-4">What Makes AIQ Different</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="text-red-600">✗</span> Traditional Assessments
                </h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Self-reported capabilities</li>
                  <li>• No performance validation</li>
                  <li>• Limited cross-cultural generalizability</li>
                  <li>• Measure isolated cognitive skills</li>
                  <li>• Static, non-adaptive questions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="text-green-600">✓</span> AIQ Assessment
                </h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Performance-based tasks</li>
                  <li>• Rigorous psychometric validation</li>
                  <li>• Culturally-sensitive scenarios</li>
                  <li>• Measures collaborative intelligence</li>
                  <li>• Adaptive difficulty using IRT</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Team */}
        <Card className="mb-10 shadow-sm border">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-2xl font-black mb-4">Research Team</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-base mb-1">Venkat Ram Reddy Ganuthula, Ph.D.</h3>
                <p className="text-xs text-muted-foreground font-semibold mb-2">
                  Assistant Professor, School of Management and Entrepreneurship, IIT Jodhpur
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Specializes in Human Capital and Organizational Dynamics with research focus on behavioral 
                  science, judgment and decision-making, and AI's implications on human behavior and organizations.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Contact:</span> ram@iitj.ac.in
                </p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">Krishna Kumar Balaraman, Ph.D.</h3>
                <p className="text-xs text-muted-foreground font-semibold mb-2">
                  Associate Professor, School of Management and Entrepreneurship, IIT Jodhpur
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Expert in Strategic and Public Policy with over 20 years in advanced technologies leadership. 
                  Research areas include strategic/technology foresight, AI strategies, governance, and entrepreneurship.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Contact:</span> krishna@iitj.ac.in
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card className="mb-10 shadow-sm border">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-2xl font-black mb-4">Real-World Applications</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="font-bold text-sm mb-2">Education</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Curriculum design</li>
                  <li>• Student assessment</li>
                  <li>• AI literacy programs</li>
                </ul>
              </div>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="font-bold text-sm mb-2">Organizations</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Workforce planning</li>
                  <li>• Talent development</li>
                  <li>• Strategic implementation</li>
                </ul>
              </div>
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="font-bold text-sm mb-2">Professionals</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Career planning</li>
                  <li>• Skill development</li>
                  <li>• Competency certification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Citation */}
        <div className="p-5 bg-accent/30 rounded-lg text-center border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-bold">Citation:</span> Ganuthula, V.R.R., Balaraman, K.K. (2025). 
            Artificial intelligence quotient framework for measuring human collaboration with artificial intelligence. 
            <span className="italic"> Discover Artificial Intelligence</span>, 5, 268. 
            <a 
              href="https://doi.org/10.1007/s44163-025-00516-1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium ml-1"
            >
              https://doi.org/10.1007/s44163-025-00516-1
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;