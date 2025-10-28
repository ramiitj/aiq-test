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
import { checkUserRole } from "@/lib/roleUtils";
import { sanitizeJsonString } from "@/lib/jsonSanitizer";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{
    beginner: boolean;
    professional: boolean;
    expert: boolean;
  }>({ beginner: false, professional: false, expert: false });
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
      const isAdmin = await checkUserRole(session.user.id);

      if (!isAdmin) {
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
      // Error already handled by RLS policies
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    version: 'beginner' | 'professional' | 'expert'
  ) => {
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

    setUploading(prev => ({ ...prev, [version]: true }));

    try {
      // Read and validate JSON file
      const fileContent = await file.text();
      const sanitized = sanitizeJsonString(fileContent);
      const jsonData = JSON.parse(sanitized);

      // Validate AIQ assessment structure
      const hasItemBank = jsonData.itemBank && 
                         jsonData.itemBank.dimensions && 
                         Array.isArray(jsonData.itemBank.dimensions);
      
      const hasMetadata = jsonData.assessmentName && 
                         jsonData.version && 
                         jsonData.assessmentType &&
                         jsonData.scoringConfiguration;
      
      if (!hasItemBank || !hasMetadata) {
        throw new Error("Invalid AIQ assessment structure: must include assessmentName, version, assessmentType, scoringConfiguration, and itemBank.dimensions array");
      }

      // Validate assessment type matches version
      if (version === 'beginner' && jsonData.assessmentType !== 'fixed') {
        console.warn('Beginner assessment should have assessmentType: "fixed"');
      }
      
      if ((version === 'professional' || version === 'expert') && jsonData.assessmentType !== 'adaptive') {
        console.warn(`${version} assessment should have assessmentType: "adaptive"`);
      }

      const fileName = `${version}-assessment.json`;
      
      // Delete old file if exists
      const { data: existingFiles } = await supabase.storage
        .from("aiq-items")
        .list();

      const existingFile = existingFiles?.find(f => f.name === fileName);
      if (existingFile) {
        await supabase.storage
          .from("aiq-items")
          .remove([fileName]);
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from("aiq-items")
        .upload(fileName, file, {
          contentType: "application/json",
          upsert: true
        });

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: `${version.charAt(0).toUpperCase() + version.slice(1)} test items uploaded successfully!`,
      });

      // Clear the input
      e.target.value = "";
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [version]: false }));
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
              Upload Test Items by Version
            </CardTitle>
            <CardDescription>
              Upload JSON files for each test version separately (Beginner, Professional, Expert)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Beginner Version */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm font-semibold">
                  Beginner
                </div>
              </div>
              <Label htmlFor="beginner-upload">Beginner Assessment JSON</Label>
              <Input
                id="beginner-upload"
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'beginner')}
                disabled={uploading.beginner}
                className="mt-2"
              />
              {uploading.beginner && (
                <p className="text-sm text-muted-foreground mt-2">Uploading beginner assessment...</p>
              )}
            </div>

            {/* Professional Version */}
            <div className="p-4 border rounded-lg border-primary">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-semibold">
                  Professional
                </div>
              </div>
              <Label htmlFor="professional-upload">Professional Assessment JSON</Label>
              <Input
                id="professional-upload"
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'professional')}
                disabled={uploading.professional}
                className="mt-2"
              />
              {uploading.professional && (
                <p className="text-sm text-muted-foreground mt-2">Uploading professional assessment...</p>
              )}
            </div>

            {/* Expert Version */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm font-semibold">
                  Expert
                </div>
              </div>
              <Label htmlFor="expert-upload">Expert Assessment JSON</Label>
              <Input
                id="expert-upload"
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'expert')}
                disabled={uploading.expert}
                className="mt-2"
              />
              {uploading.expert && (
                <p className="text-sm text-muted-foreground mt-2">Uploading expert assessment...</p>
              )}
            </div>

            <div className="p-4 bg-accent/30 rounded-lg space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Required AIQ Assessment Structure:</p>
                <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "assessmentName": "AIQ Beginner/Professional/Expert Assessment",
  "version": "1.0",
  "assessmentType": "fixed" | "adaptive",
  "description": "Assessment description",
  
  // For Beginner (fixed)
  "assessmentConfiguration": {
    "totalQuestions": 24,
    "questionsPerDimension": 3,
    "estimatedTime": "15 minutes"
  },
  
  // For Professional/Expert (adaptive)
  "adaptiveConfiguration": {
    "totalQuestions": 80,
    "questionsPerDimension": 10,
    "itemBankSize": {
      "totalItems": 400,  // 400 for Professional, 160 for Expert
      "itemsPerDimension": 50  // 50 for Professional, 20 for Expert
    }
  },
  
  "scoringConfiguration": {
    "totalPoints": 240,
    "pointsPerDimension": 30,
    "passingScore": 168
  },
  
  "itemBank": {
    "totalItems": 24,
    "itemsPerDimension": 3,
    "dimensions": [
      {
        "dimensionCode": "SAU",
        "dimensionName": "Strategic AI Understanding",
        "items": [
          {
            "id": "SAU-001",
            "level": 1,
            "type": "multiple-choice",
            "difficulty": 0.18,
            "question": "Question text...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 1
          }
        ]
      }
    ]
  }
}`}
                </pre>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">Assessment Type Requirements:</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Beginner:</strong> assessmentType: "fixed" - 24 items (3 per dimension), all presented</li>
                  <li>• <strong>Professional:</strong> assessmentType: "adaptive" - 80 from 400 items (10 from 50 per dimension)</li>
                  <li>• <strong>Expert:</strong> assessmentType: "adaptive" - 80 from 160 items (10 from 20 per dimension)</li>
                </ul>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Files are saved as: <code className="bg-background px-1 rounded">beginner-assessment.json</code>,{" "}
                <code className="bg-background px-1 rounded">professional-assessment.json</code>, and{" "}
                <code className="bg-background px-1 rounded">expert-assessment.json</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
