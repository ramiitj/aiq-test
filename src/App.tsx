import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- 1. IMPORT YOUR NEW COMPONENT ---
import ScrollToTop from "./components/ScrollToTop"; // (Adjust path if needed)

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Test from "./pages/Test";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
       {" "}
    <TooltipProvider>
            <Toaster />
            <Sonner />     {" "}
      <BrowserRouter>
                {/* --- 2. ADD IT HERE --- */}
                <ScrollToTop />               {" "}
        <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/results/:testId" element={<Results />} />
            S         <Route path="/admin" element={<Admin />} />
                    <Route path="/verify/:code" element={<Verify />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="*" element={<NotFound />} />       {" "}
        </Routes>
             {" "}
      </BrowserRouter>
         {" "}
    </TooltipProvider>
     {" "}
  </QueryClientProvider>
);

export default App;
