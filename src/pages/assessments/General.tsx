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
import { generalTrack } from "@/lib/trackData";
import { Clock, FileQuestion, Target, CheckCircle, TrendingUp } from "lucide-react";

export default function GeneralAssessments() {
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

  const Icon = generalTrack.icon;

  return (
    <>
      <Helmet>
        <title>General Track AI Assessments | AIQ Universal Competency Testing</title>
        <meta 
          name="description" 
          content="Universal AI collaboration intelligence assessments for all professionals. Validate your AI skills across 8 core dimensions with beginner and advanced levels."
        />
        <meta name="keywords" content="general AI assessment, universal AI skills, AI competency testing, AI certification" />
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
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <Badge variant="secondary">General Track</Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {generalTrack.name}
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  {generalTrack.longDescription}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Link to="/test?product=general-beginner">
                    <Button size="lg" className="font-semibold">
                      Start Beginner Assessment
                    </Button>
                  </Link>
                  <Link to="/test?product=general-advanced">
                    <Button size="lg" variant="outline" className="font-semibold">
                      Start Advanced Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <div className="container py-12 space-y-12">
            {/* Target Audience */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Who Is This For?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalTrack.targetAudience.map((audience, idx) => (
                  <Card key={idx}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-medium">{audience}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* 8 Dimensions */}
            <section>
              <h2 className="text-2xl font-bold mb-6">8 Core AI Collaboration Dimensions</h2>
              <p className="text-muted-foreground mb-6">
                Our assessment evaluates your AI collaboration skills across these universal dimensions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalTrack.dimensions.map((dimension) => (
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
              <h2 className="text-2xl font-bold mb-6">Choose Your Level</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Beginner */}
                <Card className="border-2">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">Beginner</Badge>
                    <CardTitle className="text-2xl">Foundational Level</CardTitle>
                    <CardDescription>
                      Perfect for professionals new to AI collaboration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>60 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <span>60 fixed-sequential questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>70% passing threshold (420/600 points)</span>
                      </div>
                    </div>
                    <Link to="/test?product=general-beginner" className="block">
                      <Button className="w-full">Start Beginner Assessment</Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Advanced */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <Badge className="w-fit mb-2">Advanced</Badge>
                    <CardTitle className="text-2xl">Expert Level</CardTitle>
                    <CardDescription>
                      For experienced professionals mastering AI collaboration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>80 minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <span>80 IRT-adaptive questions (from 160-item bank)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>80% passing threshold (640/800 points)</span>
                      </div>
                    </div>
                    <Link to="/test?product=general-advanced" className="block">
                      <Button className="w-full">Start Advanced Assessment</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Career Benefits */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Career Benefits</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalTrack.careerBenefits.map((benefit, idx) => (
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
              <h2 className="text-2xl font-bold mb-4">Ready to Validate Your AI Skills?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join professionals worldwide in demonstrating your AI collaboration capabilities. 
                Get personalized recommendations and a verified certificate upon passing.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/test?product=general-beginner">
                  <Button size="lg">Start Beginner</Button>
                </Link>
                <Link to="/test?product=general-advanced">
                  <Button size="lg" variant="outline">Start Advanced</Button>
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
