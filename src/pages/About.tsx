import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, Lightbulb, Shield, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", session.user.id)
        .single();
      
      setIsAdmin(data?.is_admin || false);
    }
  };

  const dimensions = [
    {
      icon: Target,
      name: "Strategic AI Understanding",
      description: "Ability to map AI capabilities to business objectives, identifying opportunities and limitations in organizational contexts."
    },
    {
      icon: Lightbulb,
      name: "Prompt Engineering Intelligence",
      description: "Skill in crafting effective prompts that elicit accurate, relevant, and contextually appropriate AI responses."
    },
    {
      icon: Brain,
      name: "Critical Evaluation Capability",
      description: "Capacity to assess AI outputs for accuracy, bias, and reliability, distinguishing between valid and problematic information."
    },
    {
      icon: Zap,
      name: "Integration Intelligence",
      description: "Proficiency in combining AI suggestions with human expertise to create superior solutions."
    },
    {
      icon: Users,
      name: "Adaptive Learning Capability",
      description: "Ability to learn from AI interactions and continuously improve collaboration patterns."
    },
    {
      icon: Shield,
      name: "Ethical Judgment in AI Utilization",
      description: "Awareness of ethical implications and ability to make responsible decisions when using AI systems."
    },
    {
      icon: Brain,
      name: "Context Sensitivity",
      description: "Understanding when AI assistance is appropriate and when human judgment should take precedence."
    },
    {
      icon: Lightbulb,
      name: "Creative Synthesis",
      description: "Capacity to use AI as a catalyst for creative thinking and innovative problem-solving."
    }
  ];

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
      
      <main className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About the AIQ Test</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A research-based framework for measuring human-AI collaboration capabilities
          </p>
        </div>

        <Card className="mb-8 shadow-elegant">
          <CardHeader>
            <CardTitle>Research Foundation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-4">
              The Artificial Intelligence Quotient (AIQ) framework is based on peer-reviewed research by 
              Venkat Ram Reddy Ganuthula and Krishna Kumar Balaraman from IIT Jodhpur. This assessment 
              addresses a critical gap in measuring human capabilities in the AI era.
            </p>
            <p className="text-muted-foreground mb-4">
              Traditional intelligence measures (IQ) and digital literacy assessments fail to capture the 
              unique skills required for effective human-AI collaboration. The AIQ framework provides a 
              standardized, performance-based assessment of these capabilities across eight key dimensions.
            </p>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">The 8 AIQ Dimensions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <Card key={index} className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-lg">{dimension.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {dimension.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="mb-8 shadow-elegant">
          <CardHeader>
            <CardTitle>Assessment Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Adaptive Testing</h3>
              <p className="text-muted-foreground text-sm">
                The test uses Item Response Theory (IRT) principles to adaptively select questions based 
                on your performance, ensuring accurate measurement across all skill levels.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance-Based Tasks</h3>
              <p className="text-muted-foreground text-sm">
                Rather than multiple-choice questions, the assessment uses real-world scenarios requiring 
                you to demonstrate practical AI collaboration skills.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comprehensive Scoring</h3>
              <p className="text-muted-foreground text-sm">
                Each response is evaluated using research-validated rubrics (0-100 scale) that assess 
                the depth and sophistication of your AI collaboration capabilities.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Research Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Venkat Ram Reddy Ganuthula, Ph.D.</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Assistant Professor, School of Management and Entrepreneurship, IIT Jodhpur
              </p>
              <p className="text-sm text-muted-foreground">
                Specializes in Human Capital and Organizational Dynamics with research focus on behavioral 
                science, judgment and decision-making, and AI's implications on human behavior and organizations. 
                Ph.D. in Management Science from IIT Madras. Contact: ram@iitj.ac.in
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Krishna Kumar Balaraman, Ph.D.</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Associate Professor, School of Management and Entrepreneurship, IIT Jodhpur
              </p>
              <p className="text-sm text-muted-foreground">
                Expert in Strategic and Public Policy with over 20 years in advanced technologies leadership. 
                Research areas include strategic/technology foresight, AI strategies, governance, and 
                entrepreneurship. Ph.D. from IIT Madras, MBA from IIM Bangalore. Contact: krishna@iitj.ac.in
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-accent/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Citation:</strong> Ganuthula, V. R. R., & Balaraman, K. K. (2025). 
            Artificial intelligence quotient framework for measuring human collaboration with 
            artificial intelligence. <em>Journal of Management Research</em>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;
