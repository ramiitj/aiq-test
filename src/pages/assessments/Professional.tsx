import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import AssessmentSelector from "@/components/AssessmentSelector";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ProfessionalAssessments() {
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
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Professional Track Assessments</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Role-specific AI collaboration assessments for working professionals across 15 specialized roles
            </p>
            <Link to="/assessments/professional/roles">
              <Button variant="outline" size="lg">
                View All 15 Professional Roles
              </Button>
            </Link>
          </div>
          
          {/* Filter to show only role-based track */}
          <div className="mt-8">
            <AssessmentSelector defaultTrack="role-based" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
