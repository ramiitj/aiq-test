import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Clock, FileText, Award, ArrowRight } from "lucide-react";

export default function AssessmentsGeneral() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const assessments = [
    {
      level: "Beginner",
      slug: "general-beginner",
      description: "Foundational AI literacy assessment for newcomers to AI collaboration",
      duration: "60 minutes",
      questions: 60,
      points: 600,
      passThreshold: "70%",
      icon: Brain,
      color: "from-blue-500 to-indigo-600",
      proficiencyLevels: ["Novice", "Beginner", "Developing", "Proficient", "Advanced"],
      idealFor: "Students, career changers, and those new to AI tools",
      demonstrates: [
        "Understanding of AI basics and core concepts",
        "Ability to work with AI tools in simple scenarios",
        "Foundational awareness of AI ethics and limitations",
        "Basic prompt engineering techniques"
      ]
    },
    {
      level: "Advanced",
      slug: "general-advanced",
      description: "Adaptive assessment for AI strategists, leaders, and research professionals",
      duration: "80 minutes",
      questions: 80,
      points: 800,
      passThreshold: "80%",
      icon: Award,
      color: "from-amber-500 to-orange-600",
      proficiencyLevels: ["Developing", "Proficient", "Advanced", "Expert", "Master"],
      idealFor: "AI professionals, researchers, and organizational leaders",
      demonstrates: [
        "Deep strategic understanding of AI technologies",
        "Expert-level prompt engineering and optimization",
        "Ethical AI governance and responsible deployment",
        "Innovation leadership and creative AI synthesis"
      ]
    }
  ];

  const dimensions = [
    { code: "SAU", name: "Strategic AI Understanding" },
    { code: "PEI", name: "Prompt Engineering & Iteration" },
    { code: "CEC", name: "Critical Evaluation & Calibration" },
    { code: "II", name: "Integration & Implementation" },
    { code: "ALC", name: "Adaptive Learning & Continuous Improvement" },
    { code: "EJC", name: "Ethical Judgment & Compliance" },
    { code: "CS", name: "Creative Synthesis" },
    { code: "CRS", name: "Collaborative Relationships & Systems" }
  ];

  return (
    <>
      <Helmet>
        <title>General Track AI Assessment - AIQ</title>
        <meta 
          name="description" 
          content="Universal AI intelligence assessment with Beginner (60 questions) and Advanced (80 IRT items) levels. Comprehensive 8-dimension evaluation for all backgrounds."
        />
        <meta name="keywords" content="AI assessment, general AI test, AI intelligence, AI certification" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navigation isAuthenticated={isAuthenticated} />
        
        <main className="flex-1 container py-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/10 rounded-full mb-4">
              <Brain className="h-8 w-8 text-blue-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              General Track Assessment
            </h1>
            <p className="text-lg text-muted-foreground">
              Universal AI collaboration assessment designed for all backgrounds and experience levels. 
              Comprehensive evaluation across 8 key dimensions with two difficulty tiers.
            </p>
          </div>

          {/* 8 Dimensions Overview */}
          <Card className="mb-12 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>8 Assessment Dimensions</CardTitle>
              <CardDescription>
                All General Track assessments evaluate these core AI collaboration competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dimensions.map((dim) => (
                  <div key={dim.code} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                    <Badge variant="outline" className="shrink-0">{dim.code}</Badge>
                    <span className="text-sm font-medium">{dim.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {assessments.map((assessment) => {
              const Icon = assessment.icon;
              return (
                <Card key={assessment.slug} className="hover:shadow-xl transition-all border-2">
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${assessment.color} rounded-lg mb-3`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl">{assessment.level}</CardTitle>
                      <Badge variant="secondary">{assessment.questions} Questions</Badge>
                    </div>
                    <CardDescription>{assessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Specs */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{assessment.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{assessment.points} points</span>
                      </div>
                    </div>

                    {/* Pass Threshold */}
                    <div className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Pass Threshold: {assessment.passThreshold}</p>
                      <p className="text-xs text-muted-foreground">Certificate awarded upon successful completion</p>
                    </div>

                    {/* Ideal For */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Ideal For:</p>
                      <p className="text-sm text-muted-foreground">{assessment.idealFor}</p>
                    </div>

                    {/* Demonstrates */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Demonstrates:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {assessment.demonstrates.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-900 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Proficiency Levels */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Proficiency Tiers:</p>
                      <div className="flex flex-wrap gap-1">
                        {assessment.proficiencyLevels.map((level) => (
                          <Badge key={level} variant="outline" className="text-xs">
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to={`/test?product=${assessment.slug}`} className="block mt-4">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg">
                        Start {assessment.level} Assessment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
