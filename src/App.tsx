import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Features from "./pages/Features";
import Research from "./pages/Research";
import Test from "./pages/Test";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import Privacy from "./pages/Privacy";
import Sitemap from "./pages/Sitemap";
import NotFound from "./pages/NotFound";
import AssessmentsGeneral from "./pages/AssessmentsGeneral";
import AssessmentsStudent from "./pages/AssessmentsStudent";
import AssessmentsProfessional from "./pages/AssessmentsProfessional";
import RoleLanding from "./pages/assessments/RoleLanding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/research" element={<Research />} />
          <Route path="/ai-assessment" element={<Test />} />
          <Route path="/results/:testId" element={<Results />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/verify-certificate/:code" element={<Verify />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/sitemap" element={<Sitemap />} />
          
          {/* Assessment Track Routes */}
          <Route path="/assessments/general" element={<AssessmentsGeneral />} />
          <Route path="/assessments/student" element={<AssessmentsStudent />} />
          <Route path="/assessments/professional" element={<AssessmentsProfessional />} />
          
          {/* Legacy redirect for adolescent -> student */}
          <Route path="/assessments/adolescent" element={<AssessmentsStudent />} />
          
          {/* Role-Specific Landing Pages */}
          <Route path="/assessments/:roleSlug" element={<RoleLanding />} />
          
          {/* Legacy URL redirects for SEO */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/test" element={<Test />} />
          <Route path="/verify/:code" element={<Verify />} />
          <Route path="/privacy" element={<Privacy />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
