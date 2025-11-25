import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import AssessmentSelector from "@/components/AssessmentSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AssessmentsProfessional() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={isAuthenticated} />
      <main className="flex-1 container py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Professional Track Assessments</h1>
          <p className="text-muted-foreground mb-4">
            Role-specific AI assessments across 15 professional specializations
          </p>
          <Link to="/assessments/professional/roles">
            <Button variant="outline">View All Professional Roles</Button>
          </Link>
        </div>
        <AssessmentSelector defaultTrack="role-based" />
      </main>
      <Footer />
    </div>
  );
}
