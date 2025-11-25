import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
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
  ArrowRight,
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
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Helmet>
        <title>About AIQ Assessment - AI Quotient Testing Platform | aiq.works</title>
        <meta
          name="description"
          content="Learn about the AIQ Framework - a scientifically validated assessment measuring AI collaboration capabilities across 8 dimensions. Built on peer-reviewed research from IIT Jodhpur."
        />
        <link rel="canonical" href="https://aiq.works/about" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "AIQ Works",
            url: "https://aiq.works",
            logo: "https://aiq.works/favicon.png",
            description:
              "Research-based AI Quotient assessment platform measuring human-AI collaboration capabilities",
            foundingDate: "2025",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Research Inquiries",
              url: "https://aiq.works/about",
            },
            parentOrganization: {
              "@type": "Organization",
              name: "IIT Jodhpur",
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://aiq.works/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "About",
                item: "https://aiq.works/about",
              },
            ],
          })}
        </script>
      </Helmet>
      <Navigation isAuthenticated={isAuthenticated} isAdmin={isAdmin} />

      <main className="container py-12 max-w-6xl flex-grow">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            About AIQ Assessment - Measuring AI Collaboration Intelligence
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A scientifically validated framework for measuring human-AI collaboration capabilities
          </p>
          <div className="mt-6">
            <Link to={isAuthenticated ? "/dashboard" : "/sign-in"}>
              <Button size="lg" className="bg-blue-900 hover:bg-blue-800 font-semibold">
                {isAuthenticated ? "Go to Dashboard" : "Start Assessment"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* The Problem We're Solving */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">
              Why AIQ<sup className="text-[0.6em]">™</sup> Assessment Is Essential
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The workforce is transforming rapidly—measurement and validation are critical to success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-red-600 mb-2">70%</div>
                <p className="text-sm text-muted-foreground mb-2">of job skills will transform by 2030 due to AI</p>
                <p className="text-xs text-muted-foreground/70">LinkedIn Work Change Report</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <TrendingUp className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-yellow-600 mb-2">74%</div>
                <p className="text-sm text-muted-foreground mb-2">
                  of companies struggle to realize full benefits from AI
                </p>
                <p className="text-xs text-muted-foreground/70">Industry AI Adoption Report 2024</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-8 pb-8 text-center">
                <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-green-600 mb-2">56%</div>
                <p className="text-sm text-muted-foreground mb-2">higher earnings for those with validated AI skills</p>
                <p className="text-xs text-muted-foreground/70">PwC Global AI Jobs Barometer 2025</p>
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

        {/* Three Assessment Tracks Explanation */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">Three Assessment Tracks</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the pathway that best matches your needs and experience level
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-4">
                  <Brain className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-center">General Track</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Universal AI collaboration intelligence for all professionals, regardless of role or industry.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Beginner: 60 questions, 60 minutes (fixed items)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Advanced: 80 questions, 80 minutes (IRT-adaptive)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Measures core AI collaboration skills across 8 dimensions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-center">Student Track</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Age-appropriate AI literacy assessments designed specifically for high school students.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ages 14-15: 24 questions, 24 minutes (fixed items)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ages 16-17: 48 questions, 48 minutes (fixed items)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Developmentally appropriate content and difficulty</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-2 border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto mb-4">
                  <Award className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-center">Professional Track</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Role-specific assessments tailored to the unique AI needs of 15 professional specializations.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>16 roles: Accounting & Finance, Business Analyst, Data Scientist, Digital Marketer, Doctors, Financial Advisors, Healthcare Admin, HR, Lawyers, Management Consultants, Ops Manager, Product Manager, Sales, Software Engineer, Teachers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Beginner (60 fixed items) & Advanced (80 IRT items) for each role</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Advanced levels use IRT-adaptive selection (80 from 160-item banks)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
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
                      We use IRT for advanced-level assessments, the gold standard in adaptive testing used by GRE, SAT, and professional certification
                      exams worldwide. Advanced assessments adaptively select 80 items from a pool of 160 calibrated items.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Advanced: Questions dynamically adapt to your ability level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Beginner & Student: Fixed item sets for consistency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>400+ calibrated performance-based items across all tracks</span>
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
                      Developed through rigorous academic research and published in leading journals.
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
              From hiring decisions to curriculum design, AIQ<sup className="text-[0.6em]">™</sup> provides actionable
              insights
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
            <p className="text-muted-foreground max-w-2xl mx-auto">Research by Experienced Academicians</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <script type="application/ld+json">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Person",
                    name: "Venkat Ram Reddy Ganuthula",
                    jobTitle: "Lead Researcher, Ph.D.",
                    description:
                      "Specializes in behavioral science, judgment and decision-making, and the intersection of AI and human behavior",
                    affiliation: {
                      "@type": "Organization",
                      name: "IIT Jodhpur",
                    },
                    sameAs: "https://www.linkedin.com/in/ganuthula/",
                    url: "https://aiq.works/about",
                  })}
                </script>
                <h3 className="font-bold text-xl mb-1">Venkat Ram Reddy Ganuthula, Ph.D.</h3>
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  <a
                    href="https://www.linkedin.com/in/ganuthula/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile of Venkat Ram Reddy Ganuthula"
                  >
                    View LinkedIn Profile
                  </a>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Lead Researcher specializing in behavioral science, judgment and decision-making, and the intersection
                  of AI and human behavior.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <script type="application/ld+json">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Person",
                    name: "Krishna Kumar Balaraman",
                    jobTitle: "Co-Researcher, Ph.D.",
                    description:
                      "Brings 20+ years of technology leadership experience. Research focuses on strategic foresight and AI governance",
                    affiliation: {
                      "@type": "Organization",
                      name: "IIT Jodhpur",
                    },
                    sameAs: "https://www.linkedin.com/in/balakk/",
                    url: "https://aiq.works/about",
                  })}
                </script>
                <h3 className="font-bold text-xl mb-1">Krishna Kumar Balaraman, Ph.D.</h3>
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  <a
                    href="https://www.linkedin.com/in/balakk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile of Krishna Kumar Balaraman"
                  >
                    View LinkedIn Profile
                  </a>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Co-Researcher bringing 20+ years of technology leadership experience. Research focuses on strategic
                  foresight and AI governance.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Link to={isAuthenticated ? "/dashboard" : "/sign-in"}>
              <Button size="lg" variant="outline" className="font-semibold">
                Take the AIQ Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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

      <Footer />
    </div>
  );
};

export default About;
