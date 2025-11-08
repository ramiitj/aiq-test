import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, BarChart3, Users } from "lucide-react";
import { checkUserRole } from "@/lib/roleUtils";
import { sanitizeJsonString } from "@/lib/jsonSanitizer";
import { AdminDataTables } from "@/components/AdminDataTables";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{
    beginner: boolean;
    advanced: boolean;
  }>({ beginner: false, advanced: false });
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
      navigate("/sign-in");
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
    version: 'beginner' | 'advanced'
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
      let jsonData: any;
      try {
        jsonData = JSON.parse(sanitized);
      } catch (err) {
        toast({
          title: "Invalid JSON file",
          description: "The file must be valid JSON format. Please check for syntax errors.",
          variant: "destructive",
        });
        setUploading(prev => ({ ...prev, [version]: false }));
        return;
      }

      // Validate AIQ assessment structure based on version
      const hasBasicMetadata = jsonData.assessmentName && 
                               jsonData.version;
      
      if (!hasBasicMetadata) {
        throw new Error("Invalid AIQ assessment structure: must include assessmentName and version");
      }

      // Version-specific validation
      if (version === 'beginner') {
        // Beginner: wrapped structure with itemBank.dimensions
        const hasItemBank = jsonData.itemBank && 
                           jsonData.itemBank.dimensions && 
                           Array.isArray(jsonData.itemBank.dimensions);
        
        if (!hasItemBank) {
          throw new Error('Beginner assessment must have itemBank.dimensions array');
        }
        
        if (jsonData.assessmentType && jsonData.assessmentType !== 'fixed') {
          throw new Error('Beginner assessment must have assessmentType: "fixed"');
        }
        
        // Validate total items for beginner (should be 60)
        const totalItems = jsonData.itemBank.dimensions.reduce((sum: number, dim: any) => sum + (dim.items?.length || 0), 0);
        if (totalItems !== 60) {
          throw new Error(`Beginner assessment must have exactly 60 items (found ${totalItems})`);
        }
      }
      
      if (version === 'advanced') {
        // Advanced: direct itemBank array
        const hasItemBank = jsonData.itemBank && Array.isArray(jsonData.itemBank);
        
        if (!hasItemBank) {
          throw new Error('Advanced assessment must have itemBank as direct array');
        }
        
        if (jsonData.assessmentType && jsonData.assessmentType !== 'adaptive') {
          throw new Error('Advanced assessment must have assessmentType: "adaptive"');
        }
        
        // Validate total items for advanced (should be 160 items across all dimensions)
        const totalItems = jsonData.itemBank.reduce((sum: number, dim: any) => sum + (dim.items?.length || 0), 0);
        if (totalItems !== 160) {
          throw new Error(`Advanced assessment must have exactly 160 items (found ${totalItems}). System will adaptively select 80 items during test.`);
        }
      }

      // Validate scoringConfiguration
      if (!jsonData.scoringConfiguration) {
        throw new Error('Missing scoringConfiguration object');
      }
      
      const scoringConfig = jsonData.scoringConfiguration;
      if (!scoringConfig.totalPoints || !scoringConfig.passingScore || !scoringConfig.scoringMethod) {
        throw new Error('Incomplete scoring configuration: must include totalPoints, passingScore, and scoringMethod');
      }
      
      if (!scoringConfig.scoringGuidelines || typeof scoringConfig.scoringGuidelines !== 'object') {
        throw new Error('Missing or invalid scoringGuidelines object');
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

      const config = jsonData.scoringConfiguration;
      const totalItems = version === 'beginner' 
        ? jsonData.itemBank.dimensions.reduce((sum: number, dim: any) => sum + (dim.items?.length || 0), 0)
        : jsonData.itemBank.reduce((sum: number, dim: any) => sum + (dim.items?.length || 0), 0);

      const itemsUsed = version === 'beginner' ? totalItems : '80 (adaptively selected from 160)';

      toast({
        title: "Success",
        description: `${version.charAt(0).toUpperCase() + version.slice(1)} assessment uploaded successfully! Items: ${itemsUsed}, Total points: ${config.totalPoints}, Passing: ${config.passingScore}`,
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
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navigation isAuthenticated={true} isAdmin={true} />
      
      <main className="container py-8 max-w-6xl flex-1">
        <h1 className="text-3xl font-bold mb-8">AIQ<sup className="text-[0.6em]">™</sup> Admin Panel</h1>

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

        <AdminDataTables />

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Test Items by Type
            </CardTitle>
            <CardDescription>
              Upload JSON files for each test type: Beginner (60 fixed items) and Advanced (160 items, 80 selected adaptively)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Beginner Version */}
            <div className="p-4 border-2 rounded-lg border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm font-bold">
                    Beginner
                  </div>
                  <span className="text-xs text-muted-foreground">Fixed • 60 Items • 60 min</span>
                </div>
              </div>
              <Label htmlFor="beginner-upload" className="font-semibold">Beginner Assessment JSON</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Foundation level assessment with 60 fixed items (8 per dimension)
              </p>
              <Input
                id="beginner-upload"
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'beginner')}
                disabled={uploading.beginner}
                className="mt-2"
              />
              {uploading.beginner && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">Uploading beginner assessment...</p>
              )}
            </div>

            {/* Advanced Version */}
            <div className="p-4 border-2 rounded-lg border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-bold">
                    Advanced
                  </div>
                  <span className="text-xs text-muted-foreground">Adaptive • 160→80 Items • 80 min</span>
                </div>
              </div>
              <Label htmlFor="advanced-upload" className="font-semibold">Advanced Assessment JSON</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Professional level with 160 items in bank, 80 adaptively selected during test (10 per dimension)
              </p>
              <Input
                id="advanced-upload"
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'advanced')}
                disabled={uploading.advanced}
                className="mt-2"
              />
              {uploading.advanced && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">Uploading advanced assessment...</p>
              )}
            </div>

            <div className="p-4 bg-accent/30 rounded-lg space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Required JSON Structure by Test Type:</p>
                
                {/* Beginner Structure */}
                <div className="mb-4">
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-bold inline-block mb-2">
                    Beginner Assessment (Fixed)
                  </div>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "assessmentName": "AIQ Beginner Assessment",
  "version": "2.0",
  "assessmentType": "fixed",
  "assessmentConfiguration": {
    "totalQuestions": 60,
    "questionsPerDimension": 8,
    "estimatedTime": "60 minutes"
  },
  "scoringConfiguration": {
    "totalPoints": 600,
    "passingScore": 420,
    "scoringMethod": { "type": "simple-sum" }
  },
  "itemBank": {
    "dimensions": [
      {
        "dimensionCode": "SAU",
        "dimensionName": "Strategic AI Understanding",
        "items": [
          {
            "id": "SAU-B-001",
            "level": 1,
            "type": "multiple-choice",
            "question": "...",
            "options": ["...", "..."],
            "correctAnswer": 0,
            "points": 10,
            "difficulty": 0.18
          }
          // ... 8 items per dimension × 8 dimensions = 60 total
        ]
      }
    ]
  }
}`}
                  </pre>
                </div>

                {/* Advanced Structure */}
                <div className="mb-4">
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-bold inline-block mb-2">
                    Advanced Assessment (Adaptive)
                  </div>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "assessmentName": "AIQ Advanced Assessment",
  "version": "7.0",
  "assessmentType": "adaptive",
  "assessmentConfiguration": {
    "totalQuestions": 160,
    "questionsPerDimension": 20,
    "estimatedTime": "80 minutes"
  },
  "scoringConfiguration": {
    "totalPoints": 1600,
    "passingScore": 1280,
    "scoringMethod": { "type": "IRT-weighted-expert" }
  },
  "itemBank": [
    {
      "dimensionCode": "SAU",
      "dimensionName": "Strategic AI Understanding",
      "items": [
        {
          "id": "SAU-A-001",
          "type": "multiple-choice",
          "question": "...",
          "options": ["...", "..."],
          "correctAnswer": 0,
          "points": 13,
          "difficulty": 0.68,
          "discrimination": 1.42
        }
        // ... 20 items per dimension × 8 dimensions = 160 total
        // System adaptively selects 10 items per dimension (80 total)
      ]
    }
  ]
}`}
                  </pre>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Differences:</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Beginner:</strong> itemBank wrapped in "dimensions" object, 60 fixed items (8 per dimension), includes "level" field</li>
                  <li>• <strong>Advanced:</strong> itemBank is direct array, 160 items in bank (20 per dimension), adaptively selects 80 items (10 per dimension) during test</li>
                  <li>• <strong>Scoring:</strong> Beginner uses simple sum (600 points), Advanced uses IRT-weighted scoring (1600 points)</li>
                  <li>• <strong>Difficulty:</strong> Advanced includes discrimination values for IRT-based item selection</li>
                </ul>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Files are saved as: <code className="bg-background px-1 rounded">beginner-assessment.json</code> and{" "}
                <code className="bg-background px-1 rounded">advanced-assessment.json</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
