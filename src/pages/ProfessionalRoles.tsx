import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { professionalRoles } from "@/lib/roleData";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, ArrowRight } from "lucide-react";

export default function ProfessionalRoles() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  return (
    <>
      <Helmet>
        <title>15 Professional Roles - AI Collaboration Assessments | AIQ</title>
        <meta 
          name="description" 
          content="Explore 15 professional role-based AI collaboration assessments. Role-specific evaluations for Product Managers, Software Engineers, Data Scientists, and 12 other specializations."
        />
        <meta name="keywords" content="professional AI assessment, role-based AI testing, career AI skills, AI certification by role" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navigation isAuthenticated={isAuthenticated} />
        
        <main className="flex-1 container py-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              15 Professional Roles
            </h1>
            <p className="text-lg text-muted-foreground">
              Role-specific AI collaboration assessments tailored to the unique requirements of each profession. 
              Each role features 8 specialized dimensions and both Beginner (60 items) and Advanced (80 IRT items) levels.
            </p>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionalRoles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.slug} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        2 Levels
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{role.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dimensions Preview */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        8 Dimensions:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.dimensions.slice(0, 4).map((dim) => (
                          <Badge key={dim.code} variant="outline" className="text-xs">
                            {dim.code}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">+4 more</Badge>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="space-y-2 pt-2">
                      <Link to={`/assessments/${role.slug}`} className="block">
                        <Button variant="default" className="w-full" size="sm">
                          View Role Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/test?product=${role.beginnerSlug}`}>
                          <Button variant="outline" className="w-full" size="sm">
                            Beginner
                          </Button>
                        </Link>
                        <Link to={`/test?product=${role.advancedSlug}`}>
                          <Button variant="outline" className="w-full" size="sm">
                            Advanced
                          </Button>
                        </Link>
                      </div>
                    </div>
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
