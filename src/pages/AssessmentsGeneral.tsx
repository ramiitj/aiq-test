import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import AssessmentSelector from "@/components/AssessmentSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AssessmentsGeneral() {
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
        <AssessmentSelector defaultTrack="general" />
      </main>
      <Footer />
    </div>
  );
}
