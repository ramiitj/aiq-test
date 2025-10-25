import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, BarChart3, Users } from "lucide-react";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalTests: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      if (!data.is_admin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: testCount } = await supabase
        .from("tests")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: userCount || 0,
        totalTests: testCount || 0,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast({
        title: "Invalid File",
        description: "Please upload a JSON file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileName = `items_${Date.now()}.json`;
      const { error: uploadError } = await supabase.storage
        .from("aiq-items")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: "Test items uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} isAdmin={true} />
        <div className="container py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={true} isAdmin={true} />
      
      <main className="container py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.totalTests}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Test Items
            </CardTitle>
            <CardDescription>
              Upload a JSON file containing test questions for the AIQ assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">JSON File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="mt-2"
              />
            </div>
            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            <div className="p-4 bg-accent/30 rounded-lg">
              <p className="text-sm font-semibold mb-2">Expected JSON Format:</p>
              <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "dimensions": [
    {
      "name": "Strategic AI Understanding",
      "items": [
        {
          "id": 1,
          "difficulty": "easy",
          "question": "...",
          "type": "mcq",
          "options": ["A: ...", "B: ..."],
          "correct": "A"
        }
      ]
    }
  ]
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
