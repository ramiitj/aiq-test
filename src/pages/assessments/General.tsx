import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import AssessmentSelector from "@/components/AssessmentSelector";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brain } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">General Track Assessments</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Universal AI collaboration intelligence assessments for all professionals
            </p>
          </div>
          
          {/* Filter to show only general track */}
          <div className="mt-8">
            <AssessmentSelector defaultTrack="general" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
