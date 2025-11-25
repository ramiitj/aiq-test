import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Clock, FileText, ArrowRight } from "lucide-react";

export default function AssessmentsStudent() {
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
      ageGroup: "Ages 14-15",
      slug: "adolescent-14-15",
      description: "Introductory AI assessment designed for younger students entering high school",
      duration: "25 minutes",
      questions: 24,
      points: 240,
      passThreshold: "70%",
      idealFor: "9th and 10th grade students beginning to explore AI tools",
      demonstrates: [
        "Basic understanding of AI concepts and capabilities",
        "Simple prompt writing for common tasks",
        "Awareness of AI limitations and appropriate use cases",
        "Introduction to AI ethics and safety"
      ]
    },
    {
      ageGroup: "Ages 16-17",
      slug: "adolescent-16-17",
      description: "Comprehensive AI assessment for advanced high school students preparing for college and careers",
      duration: "50 minutes",
      questions: 48,
      points: 480,
      passThreshold: "70%",
      idealFor: "11th and 12th grade students preparing for higher education and careers",
      demonstrates: [
        "Solid understanding of AI tools and applications",
        "Effective prompt engineering for academic tasks",
        "Critical evaluation of AI-generated content",
        "Ethical considerations in AI collaboration"
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
        <title>Student Track AI Assessment - AIQ</title>
        <meta 
          name="description" 
          content="Age-appropriate AI intelligence assessments for students aged 14-17. Two levels: Ages 14-15 (24 questions) and Ages 16-17 (48 questions)."
        />
        <meta name="keywords" content="student AI assessment, teen AI test, high school AI, AI for students" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navigation isAuthenticated={isAuthenticated} />
        
        <main className="flex-1 container py-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900/10 rounded-full mb-4">
              <GraduationCap className="h-8 w-8 text-blue-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Student Track Assessment
            </h1>
            <p className="text-lg text-muted-foreground">
              Age-appropriate AI collaboration assessments designed specifically for students aged 14-17. 
              Build foundational AI skills for academic success and future careers.
            </p>
          </div>

          {/* 8 Dimensions Overview */}
          <Card className="mb-12 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>8 Assessment Dimensions</CardTitle>
              <CardDescription>
                Age-appropriate evaluation across core AI collaboration competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dimensions.map((dim) => (
                  <Badge key={dim.code} variant="outline" className="justify-center py-2">
                    {dim.code}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {assessments.map((assessment) => (
              <Card key={assessment.slug} className="hover:shadow-xl transition-all border-2">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mb-3">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">{assessment.ageGroup}</CardTitle>
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
                    <p className="text-sm font-semibold mb-2">This Assessment Demonstrates:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {assessment.demonstrates.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-900 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <Link to={`/test?product=${assessment.slug}`} className="block mt-4">
                    <Button className="w-full bg-blue-900 hover:bg-blue-800" size="lg">
                      Start {assessment.ageGroup} Assessment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="mt-12 max-w-4xl mx-auto bg-secondary/30">
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Building Future-Ready Skills</h3>
                <p className="text-sm text-muted-foreground">
                  These assessments help students develop critical AI collaboration skills that will be essential 
                  for college applications, internships, and future careers in an AI-driven world.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
