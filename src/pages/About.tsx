import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
  BookOpen,
  Award,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  CheckCircle,
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
      name: "Strategic AI Understanding", 
      description: "Align AI capabilities with business objectives",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag1" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#FEF3C7" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag1)"/>
          <g transform="translate(100, 100)">
            <circle cx="0" cy="-20" r="25" fill="#FCD34D" stroke="#374151" strokeWidth="2.5"/>
            <path d="M -15,-20 Q -15,-30 -5,-30 L 5,-30 Q 15,-30 15,-20" fill="none" stroke="#374151" strokeWidth="2.5"/>
            <circle cx="-8" cy="-22" r="3" fill="#374151"/>
            <circle cx="8" cy="-22" r="3" fill="#374151"/>
            <path d="M -8,-12 Q 0,-8 8,-12" fill="none" stroke="#374151" strokeWidth="2.5"/>
            <rect x="-15" y="5" width="30" height="40" rx="5" fill="#FCD34D" stroke="#374151" strokeWidth="2.5"/>
            <line x1="0" y1="45" x2="0" y2="60" stroke="#374151" strokeWidth="2.5"/>
            <line x1="0" y1="60" x2="-12" y2="75" stroke="#374151" strokeWidth="2.5"/>
            <line x1="0" y1="60" x2="12" y2="75" stroke="#374151" strokeWidth="2.5"/>
            <path d="M -5,15 L 5,15 L 5,35 L -5,35 Z" fill="#FBBF24"/>
            <circle cx="-25" cy="-15" r="12" fill="#E0F2FE" stroke="#374151" strokeWidth="2"/>
            <path d="M -30,-15 L -20,-15 M -25,-20 L -25,-10" stroke="#374151" strokeWidth="2"/>
            <circle cx="25" cy="-15" r="12" fill="#E0F2FE" stroke="#374151" strokeWidth="2"/>
            <circle cx="25" cy="-15" r="6" fill="none" stroke="#374151" strokeWidth="2"/>
            <circle cx="25" cy="-15" r="2" fill="#374151"/>
          </g>
        </svg>
      )
    },
    { 
      name: "Prompt Engineering", 
      description: "Design effective prompts for optimal AI responses",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag2" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#DBEAFE" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag2)"/>
          <g transform="translate(60, 100)">
            <rect x="0" y="-40" width="80" height="80" rx="5" fill="#BAE6FD" stroke="#374151" strokeWidth="2.5"/>
            <line x1="10" y1="-25" x2="70" y2="-25" stroke="#374151" strokeWidth="2"/>
            <line x1="10" y1="-15" x2="60" y2="-15" stroke="#374151" strokeWidth="2"/>
            <line x1="10" y1="-5" x2="70" y2="-5" stroke="#374151" strokeWidth="2"/>
            <line x1="10" y1="5" x2="50" y2="5" stroke="#374151" strokeWidth="2"/>
            <circle cx="15" cy="20" r="8" fill="#FCD34D" stroke="#374151" strokeWidth="2"/>
            <path d="M 15,13 L 15,20 L 20,20" stroke="#374151" strokeWidth="2" fill="none"/>
          </g>
        </svg>
      )
    },
    { 
      name: "Critical Evaluation", 
      description: "Assess AI output quality and identify limitations",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag3" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#FED7AA" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag3)"/>
          <g transform="translate(100, 100)">
            <ellipse cx="0" cy="10" rx="30" ry="15" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
            <circle cx="0" cy="-20" r="35" fill="#FDE68A" stroke="#374151" strokeWidth="2.5"/>
            <path d="M -25,-30 Q -20,-40 -10,-35 T 0,-35 T 10,-35 Q 20,-40 25,-30" fill="none" stroke="#374151" strokeWidth="2.5"/>
            <circle cx="-12" cy="-22" r="4" fill="#374151"/>
            <circle cx="12" cy="-22" r="4" fill="#374151"/>
            <path d="M -15,-8 Q 0,-12 15,-8" fill="none" stroke="#374151" strokeWidth="2.5"/>
            <circle cx="40" cy="-30" r="15" fill="#FEF3C7" stroke="#374151" strokeWidth="2"/>
            <path d="M 35,-30 L 38,-27 L 45,-35" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
          </g>
        </svg>
      )
    },
    { 
      name: "Ethical Judgment", 
      description: "Navigate AI ethics and responsible use",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag4" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#D1FAE5" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag4)"/>
          <g transform="translate(100, 100)">
            <rect x="-35" y="-10" width="25" height="50" rx="3" fill="#A7F3D0" stroke="#374151" strokeWidth="2.5"/>
            <rect x="10" y="-10" width="25" height="50" rx="3" fill="#A7F3D0" stroke="#374151" strokeWidth="2.5"/>
            <path d="M -22,-10 Q 0,-60 22,-10" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="0" cy="-60" r="8" fill="#FCD34D" stroke="#374151" strokeWidth="2"/>
          </g>
        </svg>
      )
    },
    { 
      name: "Integration Intelligence", 
      description: "Blend AI capabilities with human expertise",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag5" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#FEF3C7" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag5)"/>
          <g transform="translate(100, 100)">
            <circle cx="-30" cy="0" r="25" fill="#FCD34D" stroke="#374151" strokeWidth="2.5"/>
            <circle cx="-30" cy="-8" r="20" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
            <circle cx="-36" cy="-12" r="3" fill="#374151"/>
            <circle cx="-24" cy="-12" r="3" fill="#374151"/>
            <path d="M -36,-4 Q -30,0 -24,-4" fill="none" stroke="#374151" strokeWidth="2"/>
            <rect x="5" y="-15" width="35" height="45" rx="3" fill="#BAE6FD" stroke="#374151" strokeWidth="2.5"/>
            <circle cx="22" cy="0" r="10" fill="#7DD3FC" stroke="#374151" strokeWidth="2"/>
            <circle cx="18" cy="-2" r="2" fill="#374151"/>
            <circle cx="26" cy="-2" r="2" fill="#374151"/>
            <line x1="15" y1="6" x2="30" y2="6" stroke="#374151" strokeWidth="2"/>
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#374151" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="-5" cy="0" r="4" fill="#FCD34D" stroke="#374151" strokeWidth="2"/>
            <circle cx="5" cy="0" r="4" fill="#BAE6FD" stroke="#374151" strokeWidth="2"/>
          </g>
        </svg>
      )
    },
    { 
      name: "Adaptive Learning", 
      description: "Refine collaboration strategies over time",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag6" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#E0E7FF" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag6)"/>
          <g transform="translate(100, 100)">
            <rect x="-40" y="-30" width="80" height="60" rx="5" fill="#C7D2FE" stroke="#374151" strokeWidth="2.5"/>
            <path d="M 0,-15 L 0,15" stroke="#374151" strokeWidth="2"/>
            <path d="M -25,0 L 25,0" stroke="#374151" strokeWidth="2"/>
            <path d="M -20,-20 L -10,-10 L -20,0" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 0,-20 L 10,-10 L 0,0" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 20,-10 L 15,0 L 10,10" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="-20" cy="-20" r="3" fill="#FCD34D"/>
            <circle cx="0" cy="-20" r="3" fill="#FCD34D"/>
            <circle cx="10" cy="10" r="3" fill="#FCD34D"/>
          </g>
        </svg>
      )
    },
    { 
      name: "Context Sensitivity", 
      description: "Adapt AI use to different situations",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag7" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#FED7AA" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag7)"/>
          <g transform="translate(100, 100)">
            <circle cx="0" cy="0" r="50" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="8 4"/>
            <circle cx="0" cy="0" r="35" fill="#FED7AA" stroke="#374151" strokeWidth="2.5"/>
            <circle cx="-12" cy="-5" r="4" fill="#374151"/>
            <circle cx="12" cy="-5" r="4" fill="#374151"/>
            <path d="M -15,10 Q 0,15 15,10" fill="none" stroke="#374151" strokeWidth="2.5"/>
            <path d="M -20,-20 Q -15,-25 -10,-20 L -10,-10" fill="none" stroke="#374151" strokeWidth="2.5"/>
            <path d="M 20,-20 Q 15,-25 10,-20 L 10,-10" fill="none" stroke="#374151" strokeWidth="2.5"/>
            <circle cx="-35" cy="-15" r="8" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
            <line x1="-38" y1="-15" x2="-32" y2="-15" stroke="#374151" strokeWidth="2"/>
            <line x1="-35" y1="-18" x2="-35" y2="-12" stroke="#374151" strokeWidth="2"/>
          </g>
        </svg>
      )
    },
    { 
      name: "Creative Synthesis", 
      description: "Leverage AI for innovation and problem-solving",
      illustration: (
        <svg viewBox="0 0 200 200" className="w-full h-32">
          <defs>
            <pattern id="diag8" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#FEF3C7" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#diag8)"/>
          <g transform="translate(100, 120)">
            <ellipse cx="0" cy="0" rx="25" ry="10" fill="#FCD34D" stroke="#374151" strokeWidth="2.5"/>
            <path d="M -25,0 L -15,-40 L 15,-40 L 25,0" fill="#FDE68A" stroke="#374151" strokeWidth="2.5"/>
            <path d="M -10,-25 L 10,-25" stroke="#374151" strokeWidth="2"/>
            <line x1="-10" y1="-55" x2="-10" y2="-40" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
            <line x1="0" y1="-60" x2="0" y2="-40" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
            <line x1="10" y1="-55" x2="10" y2="-40" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
            <line x1="-15" y1="-50" x2="-15" y2="-40" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="-50" x2="15" y2="-40" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="0" cy="-30" r="6" fill="#FCD34D" stroke="#374151" strokeWidth="2"/>
          </g>
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navigation isAuthenticated={isAuthenticated} isAdmin={isAdmin} />

      <main className="container py-12 max-w-6xl flex-grow">
        {/* Hero Section with Illustration */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <svg viewBox="0 0 400 200" className="w-full max-w-2xl mx-auto h-48">
              <defs>
                <pattern id="heroPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                  <path d="M-2.5,2.5 l5,-5 M0,10 l10,-10 M7.5,12.5 l5,-5" stroke="#DBEAFE" strokeWidth="2"/>
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#heroPattern)"/>
              
              {/* Traditional IQ side */}
              <g transform="translate(100, 100)">
                <circle cx="0" cy="-20" r="30" fill="#FCD34D" stroke="#374151" strokeWidth="3"/>
                <ellipse cx="0" cy="15" rx="20" ry="8" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
                <path d="M -20,-30 Q -15,-40 -8,-35 L 8,-35 Q 15,-40 20,-30" fill="none" stroke="#374151" strokeWidth="3"/>
                <circle cx="-10" cy="-25" r="4" fill="#374151"/>
                <circle cx="10" cy="-25" r="4" fill="#374151"/>
                <path d="M -12,-10 Q 0,-5 12,-10" fill="none" stroke="#374151" strokeWidth="3"/>
                
                {/* Brain thought bubble */}
                <ellipse cx="-5" cy="-55" rx="15" ry="12" fill="#FEF3C7" stroke="#374151" strokeWidth="2"/>
                <path d="M -12,-50 Q -10,-53 -8,-50 Q -6,-47 -4,-50 Q -2,-53 0,-50 Q 2,-47 4,-50" fill="#FDA4AF" stroke="#374151" strokeWidth="1.5"/>
                <circle cx="-15" cy="-40" r="4" fill="#FEF3C7" stroke="#374151" strokeWidth="2"/>
                <circle cx="-10" cy="-35" r="3" fill="#FEF3C7" stroke="#374151" strokeWidth="2"/>
              </g>

              {/* VS or Arrow */}
              <g transform="translate(200, 100)">
                <path d="M -20,0 L 20,0" stroke="#374151" strokeWidth="3" markerEnd="url(#arrowhead)"/>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#374151"/>
                  </marker>
                </defs>
              </g>

              {/* AI Collaboration side */}
              <g transform="translate(300, 100)">
                {/* Human */}
                <circle cx="-25" cy="-20" r="20" fill="#FCD34D" stroke="#374151" strokeWidth="2.5"/>
                <ellipse cx="-25" cy="8" rx="15" ry="6" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
                <circle cx="-30" cy="-23" r="3" fill="#374151"/>
                <circle cx="-20" cy="-23" r="3" fill="#374151"/>
                <path d="M -30,-13 Q -25,-10 -20,-13" fill="none" stroke="#374151" strokeWidth="2"/>
                
                {/* Robot */}
                <rect x="5" y="-25" width="30" height="35" rx="3" fill="#BAE6FD" stroke="#374151" strokeWidth="2.5"/>
                <circle cx="15" cy="-15" r="4" fill="#374151"/>
                <circle cx="25" cy="-15" r="4" fill="#374151"/>
                <rect x="12" y="-5" width="16" height="3" rx="1" fill="#374151"/>
                <circle cx="20" cy="15" r="3" fill="#60A5FA"/>
                <line x1="5" y1="10" x2="-5" y2="15" stroke="#374151" strokeWidth="2.5"/>
                <line x1="35" y1="10" x2="45" y2="15" stroke="#374151" strokeWidth="2.5"/>
                
                {/* Shared lightbulb */}
                <ellipse cx="5" cy="-45" rx="12" ry="8" fill="#FEF3C7" stroke="#374151" strokeWidth="2"/>
                <circle cx="5" cy="-45" r="10" fill="#FDE68A" stroke="#374151" strokeWidth="2.5"/>
                <path d="M 0,-45 L 10,-45" stroke="#374151" strokeWidth="2"/>
                <rect x="2" y="-37" width="6" height="4" fill="#FCD34D" stroke="#374151" strokeWidth="1.5"/>
                <line x1="-3" y1="-50" x2="-8" y2="-55" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="13" y1="-50" x2="18" y2="-55" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="5" y1="-57" x2="5" y2="-62" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            About the AIQ<sup className="text-[0.6em] text-blue-600">™</sup> Framework
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A scientifically validated framework for measuring human-AI collaboration capabilities
          </p>
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

        {/* What We Measure: 8 Dimensions with Custom Illustrations */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">The 8 Dimensions of AI Collaboration</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our framework measures the complete spectrum of skills needed to work effectively with AI systems
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {dimensions.map((dimension, index) => (
              <Card key={index} className="shadow-sm border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="pt-6 pb-6">
                  <div className="mb-4 rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-2">
                    {dimension.illustration}
                  </div>
                  <h3 className="text-sm font-bold mb-2 text-center">{dimension.name}</h3>
                  <p className="text-xs text-muted-foreground text-center">{dimension.description}</p>
                </CardContent>
              </Card>
            ))}
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
                        <span>Adaptive difficulty: Questions adjust to your ability level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Precise measurement: More accurate than traditional fixed tests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Shorter tests: Get reliable results with fewer questions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Validated & Peer-Reviewed</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Our assessment has been validated through rigorous research and published in peer-reviewed academic
                      journals.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Empirical validation with diverse participant samples</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Published in Discover Artificial Intelligence journal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Transparent methodology available for review</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Applications Across Sectors with Illustrations */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold mb-3">Applications Across Sectors</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From hiring decisions to curriculum design, AIQ<sup className="text-[0.6em]">™</sup> provides actionable
              insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
              <CardContent className="pt-8 pb-8">
                <div className="mb-6">
                  <svg viewBox="0 0 200 150" className="w-full h-28 mx-auto">
                    <defs>
                      <pattern id="org" patternUnits="userSpaceOnUse" width="8" height="8">
                        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#DBEAFE" strokeWidth="2"/>
                      </pattern>
                    </defs>
                    <rect width="200" height="150" fill="url(#org)"/>
                    <g transform="translate(100, 75)">
                      <circle cx="0" cy="-20" r="20" fill="#FCD34D" stroke="#374151" strokeWidth="2"/>
                      <circle cx="-7" cy="-23" r="3" fill="#374151"/>
                      <circle cx="7" cy="-23" r="3" fill="#374151"/>
                      <path d="M -8,-12 Q 0,-8 8,-12" fill="none" stroke="#374151" strokeWidth="2"/>
                      <rect x="-12" y="0" width="24" height="30" rx="3" fill="#FCD34D" stroke="#374151" strokeWidth="2"/>
                      
                      <circle cx="-40" cy="0" r="15" fill="#BAE6FD" stroke="#374151" strokeWidth="2"/>
                      <circle cx="-43" cy="-3" r="2" fill="#374151"/>
                      <circle cx="-37" cy="-3" r="2" fill="#374151"/>
                      <path d="M -43,3 Q -40,5 -37,3" fill="none" stroke="#374151" strokeWidth="1.5"/>
                      
                      <circle cx="40" cy="0" r="15" fill="#A7F3D0" stroke="#374151" strokeWidth="2"/>
                      <circle cx="37" cy="-3" r="2" fill="#374151"/>
                      <circle cx="43" cy="-3" r="2" fill="#374151"/>
                      <path d="M 37,3 Q 40,5 43,3" fill="none" stroke="#374151" strokeWidth="1.5"/>
                      
                      <line x1="-25" y1="0" x2="-12" y2="10" stroke="#374151" strokeWidth="2"/>
                      <line x1="25" y1="0" x2="12" y2="10" stroke="#374151" strokeWidth="2"/>
                    </g>
                  </svg>
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

            <Card className="shadow-sm border bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
              <CardContent className="pt-8 pb-8">
                <div className="mb-6">
                  <svg viewBox="0 0 200 150" className="w-full h-28 mx-auto">
                    <defs>
                      <pattern id="edu" patternUnits="userSpaceOnUse" width="8" height="8">
                        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#D1FAE5" strokeWidth="2"/>
                      </pattern>
                    </defs>
                    <rect width="200" height="150" fill="url(#edu)"/>
                    <g transform="translate(100, 90)">
                      <rect x="-50" y="-30" width="100" height="60" rx="5" fill="#A7F3D0" stroke="#374151" strokeWidth="2.5"/>
                      <rect x="-40" y="-20" width="80" height="3" fill="#374151"/>
                      <rect x="-40" y="-10" width="60" height="3" fill="#374151"/>
                      <rect x="-40" y="0" width="70" height="3" fill="#374151"/>
                      <rect x="-40" y="10" width="50" height="3" fill="#374151"/>
                      <path d="M -60,-50 L 0,-70 L 60,-50 L 60,-45 L 0,-65 L -60,-45 Z" fill="#FCD34D" stroke="#374151" strokeWidth="2.5"/>
                      <rect x="-3" y="-65" width="6" height="10" fill="#FCD34D" stroke="#374151" strokeWidth="2"/>
                      <circle cx="0" cy="-58" r="5" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
                    </g>
                  </svg>
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

            <Card className="shadow-sm border bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
              <CardContent className="pt-8 pb-8">
                <div className="mb-6">
                  <svg viewBox="0 0 200 150" className="w-full h-28 mx-auto">
                    <defs>
                      <pattern id="pro" patternUnits="userSpaceOnUse" width="8" height="8">
                        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#E9D5FF" strokeWidth="2"/>
                      </pattern>
                    </defs>
                    <rect width="200" height="150" fill="url(#pro)"/>
                    <g transform="translate(100, 75)">
                      <circle cx="0" cy="0" r="35" fill="#C4B5FD" stroke="#374151" strokeWidth="2.5"/>
                      <path d="M 0,-20 L -15,5 L -8,5 L -8,15 L 8,15 L 8,5 L 15,5 Z" fill="#FCD34D" stroke="#374151" strokeWidth="2.5"/>
                      <circle cx="0" cy="-20" r="8" fill="#FDE68A" stroke="#374151" strokeWidth="2"/>
                      <line x1="-5" y1="-23" x2="-10" y2="-28" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="5" y1="-23" x2="10" y2="-28" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="0" y1="-28" x2="0" y2="-33" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round"/>
                    </g>
                  </svg>
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
            <h3 className="font-bold text-xl mb-1">Venkat Ram Reddy Ganuthula, Ph.D.</h3>
            <p className="text-sm text-blue-900 font-semibold mb-3">
              <a href="https://www.linkedin.com/in/ganuthula/" target="_blank" rel="noopener noreferrer">
                https://www.linkedin.com/in/ganuthula/
              </a>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Specializes in behavioral science, judgment and decision-making, and the intersection of AI and human
              behavior.
            </p>
          </CardContent>
        </Card>

            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-bold text-xl mb-1">Krishna Kumar Balaraman, Ph.D.</h3>
                <p className="text-sm text-blue-900 font-semibold mb-3">
                  <a href="https://www.linkedin.com/in/balakk/" target="_blank" rel="noopener noreferrer">
                    https://www.linkedin.com/in/balakk/
                  </a>
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Brings 20+ years of technology leadership experience. Research focuses on strategic foresight and AI
                  governance.
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

      <Footer />
    </div>
  );
};

export default About;