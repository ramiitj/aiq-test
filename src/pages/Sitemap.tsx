import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Home, Info, Lock, LayoutDashboard } from "lucide-react";

const Sitemap = () => {
  const pages = [
    { path: "/", name: "Home", icon: Home, description: "Start your AIQ assessment journey" },
    { path: "/about", name: "About AIQ Framework", icon: Info, description: "Learn about the research and methodology" },
    { path: "/auth", name: "Sign In / Sign Up", icon: FileText, description: "Access your account and results" },
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard, description: "View your assessment history and certificates" },
    { path: "/privacy", name: "Privacy Policy", icon: Lock, description: "Our commitment to your data privacy" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation isAuthenticated={false} />
      
      <main className="flex-grow container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Site Map
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete overview of all pages on the AIQ Test Platform
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black">All Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                        {page.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {page.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        https://aiq.works{page.path}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t">
              <h3 className="font-bold text-lg mb-4">Additional Resources</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <span className="font-semibold">XML Sitemap:</span> <a href="/sitemap.xml" className="text-primary hover:underline">https://aiq.works/sitemap.xml</a></p>
                <p>• <span className="font-semibold">Robots.txt:</span> <a href="/robots.txt" className="text-primary hover:underline">https://aiq.works/robots.txt</a></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Sitemap;
