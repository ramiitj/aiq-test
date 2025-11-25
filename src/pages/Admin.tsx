import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, BarChart3, Users } from "lucide-react";
import { checkUserRole } from "@/lib/roleUtils";
import { sanitizeJsonString, sanitizeKeys } from "@/lib/jsonSanitizer";
import { AdminDataTables } from "@/components/AdminDataTables";
import { AdminProductAnalytics } from "@/components/AdminProductAnalytics";
import { z } from "zod";

// Comprehensive validation schema for assessment uploads
const assessmentItemSchema = z.object({
  id: z.string().regex(/^[A-Z]{2,3}-[A-Z0-9]+-\d{3}$/, "Invalid item ID format"),
  level: z.number().min(1).max(3),
  type: z.enum(['multiple-choice', 'true-false', 'multiple-response', 'scenario-based', 'rank-ordering']),
  points: z.number().min(1).max(50),
  difficulty: z.number().min(0).max(1),
  bloomLevel: z.string().optional(),
  question: z.string().min(10).max(2000),
  options: z.array(z.string().min(1).max(500)).min(2).max(10).optional(),
  correctAnswer: z.union([z.number(), z.boolean()]).optional(),
  correctAnswers: z.array(z.number()).optional(),
  rationale: z.string().max(1000).optional(),
  explanation: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  discrimination: z.number().min(0).max(3).optional(),
});

const dimensionSchema = z.object({
  dimensionCode: z.enum([
    'SAU', 'PEI', 'CEC', 'II', 'ALC', 'EJC', 'CS', 'CRS', 
    'PAI', 'AIF', 'UEA', 'DMI', 'DMP', 'DP', 'DSA', 'PMA',
    'AAI', 'FAA', 'ATP', 'ADA', 'CRA', 'EGC', 'SAC', 'TAS',
    'BAI', 'RDA', 'DIA', 'PSM', 'STE', 'ABV', 'CCI', 'TDA',
    'PAM', 'DGA', 'SIM', 'VBC', 'RSC', 'SAV', 'AAO',
    'MAI', 'MDE', 'MEV', 'DPP', 'MPD', 'ERM', 'CCE', 'TIO',
    'CAC', 'CSI', 'CPO', 'PMM', 'PEC', 'ETC', 'TAP',
    'SMA', 'AAD', 'AOM', 'AAM', 'AEX', 'AET', 'ALG', 'ATR',
    'MDA', 'CDM', 'PDM', 'CRD', 'RAC', 'DSA',
    'FAI', 'CPA', 'RIA', 'PFA', 'CRE',
    'HAI', 'OPM', 'FRM', 'QPS', 'WFM',
    'TAA', 'PDA', 'HRA', 'EEC', 'CEG', 'SCS', 'VTO',
    'LAI', 'PEL', 'CER', 'IAV', 'LLC', 'CSL', 'TLS',
    'CAI', 'STA', 'CDA', 'PIA', 'CMA', 'DDA', 'EIS', 'CIT',
    'OAI', 'PAW', 'PFO', 'QDM', 'SCL', 'RCO', 'CIO', 'TCI',
    'RDC', 'SMI', 'PRL', 'CPE',
    // Sales Professional dimensions (ETS = Ethics, Trust & Sales Compliance)
    'SAI', 'LPO', 'CII', 'SFP', 'CAE', 'PWO', 'TSI', 'ETS',
    'FOA', 'PER', 'STR',
    // Software Development Engineer dimensions (DPE = Data & Prompt Engineering, AIP = AI Product Integration)
    'AIC', 'MIA', 'PAO', 'TDE', 'SRC', 'UIF', 'ADE', 'DPE',
    'AIA', 'MLE', 'DSE', 'SRS', 'IAT', 'TQA', 'DAE', 'AIP',
    // Product Manager dimensions (PMD = Product Manager Data)
    'PMD',
    // Teachers dimensions
    'TEA', 'PLD', 'ASE', 'EAI', 'ACI'
  ]),
  dimensionName: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  weight: z.number().min(0).max(1).optional(),
  items: z.array(assessmentItemSchema).min(1).max(100),
  totalPoints: z.number().positive().optional(),
});

// Support both JSON structures: fixed-sequential and adaptive IRT
const assessmentUploadSchema = z.object({
  assessmentName: z.string().min(1).max(200),
  version: z.string().min(1).max(50),
  tier: z.string().optional(),
  type: z.string().optional(),
  description: z.string().max(2000).optional(),
  // Support both formats: itemBank.dimensions[] (beginner) OR itemBank[] (advanced)
  itemBank: z.union([
    z.object({
      dimensions: z.array(dimensionSchema).min(1).max(20),
    }),
    z.array(dimensionSchema).min(1).max(20), // Direct array for advanced format
  ]),
  presentationMode: z.object({
    type: z.enum(['fixed-sequential', 'adaptive-sequential']),
    description: z.string().optional(),
  }).optional(),
  questionDistribution: z.object({
    totalItems: z.number().optional(),
    itemsPerDimension: z.union([z.number(), z.string()]).optional(),
    selectionRatio: z.string().optional(),
  }).optional(),
  scoringConfiguration: z.object({
    totalPoints: z.number().positive(),
    pointsPerDimension: z.number().positive().optional(),
    passingScore: z.number().min(0),
    passingPercentage: z.number().min(0).max(100).optional(),
    scoringMethod: z.union([z.string(), z.object({}).passthrough()]).optional(),
    scoringGuidelines: z.union([
      z.record(z.string()), // Simple format: "0-50%": "Developing"
      z.object({}).passthrough(), // Complex nested format
    ]).optional(),
  }),
  assessmentConfiguration: z.object({
    totalQuestions: z.number().positive().optional(),
    estimatedTime: z.number().positive().optional(),
  }).optional(),
});

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({ totalUsers: 0, totalTests: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("assessment_products")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (!error && data) {
        setProducts(data);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    product: any
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.name.endsWith(".json")) {
      toast({
        title: "Invalid File",
        description: "Please upload a JSON file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(prev => ({ ...prev, [product.slug]: true }));

    try {
      // Read and validate JSON file
      const fileContent = await file.text();
      const sanitized = sanitizeJsonString(fileContent);
      let jsonData: any;
      try {
        jsonData = JSON.parse(sanitized);
        // Security: Sanitize keys to prevent prototype pollution
        jsonData = sanitizeKeys(jsonData);
      } catch (err) {
        toast({
          title: "Invalid JSON file",
          description: "The file must be valid JSON format. Please check for syntax errors.",
          variant: "destructive",
        });
        setUploading(prev => ({ ...prev, [product.slug]: false }));
        return;
      }

      // Comprehensive Zod validation
      const validationResult = assessmentUploadSchema.safeParse(jsonData);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        const errorPath = firstError.path.join('.');
        toast({
          title: "Validation Failed",
          description: `${errorPath}: ${firstError.message}`,
          variant: "destructive",
        });
        setUploading(prev => ({ ...prev, [product.slug]: false }));
        return;
      }

      // Use validated data
      jsonData = validationResult.data;

      // Additional business logic validation
      const dimensions = Array.isArray(jsonData.itemBank) 
        ? jsonData.itemBank 
        : jsonData.itemBank.dimensions;
      
      const totalItemPoints = dimensions.reduce(
        (sum: number, dim: any) => sum + dim.items.reduce((s: number, item: any) => s + item.points, 0),
        0
      );
      
      // For IRT assessments, validate bank size vs selected items
      if (jsonData.presentationMode?.type === 'adaptive-sequential') {
        const totalBankItems = dimensions.reduce((sum: number, dim: any) => sum + dim.items.length, 0);
        const targetItems = jsonData.questionDistribution?.totalItems || jsonData.assessmentConfiguration?.totalQuestions || 0;
        
        if (targetItems && totalBankItems < targetItems) {
          toast({
            title: "Validation Failed",
            description: `IRT assessment requires item bank (${totalBankItems}) >= target items (${targetItems})`,
            variant: "destructive",
          });
          setUploading(prev => ({ ...prev, [product.slug]: false }));
          return;
        }
      }
      
      if (Math.abs(totalItemPoints - jsonData.scoringConfiguration.totalPoints) > 50) {
        toast({
          title: "Validation Warning",
          description: `Total item points (${totalItemPoints}) differs from scoring config (${jsonData.scoringConfiguration.totalPoints})`,
          variant: "destructive",
        });
      }

      // Use the file path from the product's json_file_path
      const fileName = product.json_file_path.split('/').pop();

      const { error: uploadError } = await supabase.storage
        .from("aiq-items")
        .upload(fileName, file, {
          upsert: true,
          contentType: "application/json",
        });

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: `${product.name} uploaded successfully! ${product.question_count} questions, ${product.duration_minutes} minutes`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(prev => ({ ...prev, [product.slug]: false }));
      e.target.value = '';
    }
  };

  const UploadCard = ({ product }: { product: any }) => {
    const difficultyColors: Record<string, { border: string; bg: string; badge: string; text: string }> = {
      beginner: {
        border: 'border-green-200 dark:border-green-800',
        bg: 'bg-green-50/50 dark:bg-green-950/20',
        badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        text: 'text-green-600 dark:text-green-400'
      },
      advanced: {
        border: 'border-blue-200 dark:border-blue-800',
        bg: 'bg-blue-50/50 dark:bg-blue-950/20',
        badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        text: 'text-blue-600 dark:text-blue-400'
      },
      expert: {
        border: 'border-purple-200 dark:border-purple-800',
        bg: 'bg-purple-50/50 dark:bg-purple-950/20',
        badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        text: 'text-purple-600 dark:text-purple-400'
      }
    };

    const colors = difficultyColors[product.difficulty_level] || difficultyColors.beginner;

    return (
      <div className={`p-4 border-2 rounded-lg ${colors.border} ${colors.bg}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 ${colors.badge} rounded text-sm font-bold`}>
              {product.difficulty_level}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.question_count} items • {product.duration_minutes} min
            </span>
          </div>
        </div>
        <Label htmlFor={`upload-${product.slug}`} className="font-semibold">
          {product.name}
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          {product.description}
        </p>
        <Input
          id={`upload-${product.slug}`}
          type="file"
          accept=".json"
          onChange={(e) => handleFileUpload(e, product)}
          disabled={uploading[product.slug]}
          className="mt-2"
        />
        {uploading[product.slug] && (
          <p className={`text-sm ${colors.text} mt-2 font-medium`}>
            Uploading {product.name}...
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation isAuthenticated={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation isAuthenticated={true} />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">
          Manage AIQ platform content and view analytics
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Test Items by Assessment Product
            </CardTitle>
            <CardDescription>
              Upload JSON files for each assessment product. Files will be saved to their configured paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* General Assessments */}
            {products.filter(p => p.slug.startsWith('general-')).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">General Assessments</h3>
                <div className="space-y-4">
                  {products.filter(p => p.slug.startsWith('general-')).map(product => (
                    <UploadCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Student/Adolescent Assessments */}
            {products.filter(p => p.slug.startsWith('adolescent-')).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Student Assessments</h3>
                <div className="space-y-4">
                  {products.filter(p => p.slug.startsWith('adolescent-')).map(product => (
                    <UploadCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Professional/Role-Based Assessments */}
            {products.filter(p => !p.slug.startsWith('general-') && !p.slug.startsWith('adolescent-')).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Professional Assessments</h3>
                <div className="space-y-4">
                  {products.filter(p => !p.slug.startsWith('general-') && !p.slug.startsWith('adolescent-')).map(product => (
                    <UploadCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <AdminProductAnalytics />
        <AdminDataTables />
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
