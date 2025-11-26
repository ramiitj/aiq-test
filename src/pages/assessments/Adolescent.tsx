import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { adolescent14_15Track, adolescent16_17Track } from "@/lib/trackData";
import { Clock, FileQuestion, Target, CheckCircle, TrendingUp, GraduationCap } from "lucide-react";

export default function AdolescentAssessments() {
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
    <>
      <Helmet>
        <title>Student Track AI Assessments | AIQ Age-Appropriate AI Literacy</title>
        <meta 
          name="description" 
          content="Age-appropriate AI literacy assessments for high school students (ages 14-17). Build foundational AI collaboration skills with grade-appropriate content."
        />
        <meta name="keywords" content="student AI assessment, teenage AI literacy, high school AI skills, AI education teens" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navigation isAuthenticated={isAuthenticated} />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-primary/5 to-background py-16">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <GraduationCap className="h-10 w-10 text-primary" />
                  </div>
                  <Badge variant="secondary">Student Track</Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Student Track Assessments
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Age-appropriate AI literacy assessments for high school students. Build essential AI collaboration 
                  skills with content designed specifically for teenage learners, emphasizing academic applications, 
                  digital citizenship, and responsible AI use in educational contexts.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Link to="/test?product=adolescent-14-15">
                    <Button size="lg" className="font-semibold">
                      Start Ages 14-15 (Grade 9-10)
                    </Button>
                  </Link>
                  <Link to="/test?product=adolescent-16-17">
                    <Button size="lg" variant="outline" className="font-semibold">
                      Start Ages 16-17 (Grade 11-12)
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <div className="container py-12 space-y-12">
            {/* Target Audience - Combined */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Who Is This For?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline">Ages 14-15</Badge>
                      Grade 9-10 Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {adolescent14_15Track.targetAudience.map((audience, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{audience}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline">Ages 16-17</Badge>
                      Grade 11-12 Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {adolescent16_17Track.targetAudience.map((audience, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{audience}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            {/* 8 Dimensions - Ages 14-15 */}
            <section>
              <h2 className="text-2xl font-bold mb-6">8 AI Literacy Dimensions (Ages 14-15)</h2>
              <p className="text-muted-foreground mb-6">
                For Grade 9-10 students, our assessment evaluates age-appropriate AI collaboration skills:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adolescent14_15Track.dimensions.map((dimension) => (
                  <Card key={dimension.code}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{dimension.name}</CardTitle>
                        <Badge variant="outline">{dimension.code}</Badge>
                      </div>
                      <CardDescription>{dimension.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* 8 Dimensions - Ages 16-17 */}
            <section>
              <h2 className="text-2xl font-bold mb-6">8 AI Literacy Dimensions (Ages 16-17)</h2>
              <p className="text-muted-foreground mb-6">
                For Grade 11-12 students, our assessment evaluates advanced AI collaboration skills:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adolescent16_17Track.dimensions.map((dimension) => (
                  <Card key={dimension.code}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{dimension.name}</CardTitle>
                        <Badge variant="outline">{dimension.code}</Badge>
                      </div>
                      <CardDescription>{dimension.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* Assessment Levels */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Choose Your Age Group</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ages 14-15 */}
                <Card className="border-2">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">Ages 14-15</Badge>
                    <CardTitle className="text-2xl">Grade 9-10 Students</CardTitle>
                    <CardDescription>
                      Foundational AI literacy for high school freshmen and sophomores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>25 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <span>24 age-appropriate questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>70% passing threshold (168/240 points)</span>
                      </div>
                    </div>
                    <Link to="/test?product=adolescent-14-15" className="block">
                      <Button className="w-full">Start Assessment (14-15)</Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Ages 16-17 */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <Badge className="w-fit mb-2">Ages 16-17</Badge>
                    <CardTitle className="text-2xl">Grade 11-12 Students</CardTitle>
                    <CardDescription>
                      Advanced AI literacy for college-bound high school juniors and seniors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>50 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <span>48 advanced questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>70% passing threshold (336/480 points)</span>
                      </div>
                    </div>
                    <Link to="/test?product=adolescent-16-17" className="block">
                      <Button className="w-full">Start Assessment (16-17)</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Benefits */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Student Benefits</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adolescent16_17Track.careerBenefits.map((benefit, idx) => (
                  <Card key={idx} className="bg-primary/5">
                    <CardContent className="flex items-start gap-3 p-4">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Build Your AI Skills?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join students worldwide in developing essential AI literacy skills. 
                Get personalized recommendations and a verified certificate to showcase your achievement.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/test?product=adolescent-14-15">
                  <Button size="lg">Start Ages 14-15</Button>
                </Link>
                <Link to="/test?product=adolescent-16-17">
                  <Button size="lg" variant="outline">Start Ages 16-17</Button>
                </Link>
              </div>
            </section>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
