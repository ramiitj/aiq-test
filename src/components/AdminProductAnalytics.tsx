import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";

interface ProductStat {
  product_slug: string;
  product_name: string;
  track: string;
  total_tests: number;
  completed_tests: number;
  avg_score: number;
  pass_rate: number;
  question_count: number;
  duration_minutes: number;
  total_points: number;
  passing_score: number | null;
  difficulty_level: string;
}

export function AdminProductAnalytics() {
  const [stats, setStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    try {
      // Fetch all assessment products with full details
      const { data: products } = await supabase
        .from("assessment_products")
        .select("slug, name, track, question_count, duration_minutes, total_points, passing_score, difficulty_level")
        .eq("is_active", true)
        .order("display_order");

      if (!products) return;

      // Fetch stats for each product
      const statsPromises = products.map(async (product) => {
        // Count total tests for this product
        const { count: totalTests } = await supabase
          .from("tests")
          .select("*", { count: "exact", head: true })
          .eq("product_slug", product.slug);

        // Count completed tests
        const { count: completedTests } = await supabase
          .from("tests")
          .select("*", { count: "exact", head: true })
          .eq("product_slug", product.slug)
          .eq("completed", true);

        // Get average score and pass rate from public_results
        const { data: results } = await supabase
          .from("public_results")
          .select("overall_score, test_version")
          .eq("product_slug", product.slug);

        let avgScore = 0;
        let passRate = 0;

        if (results && results.length > 0) {
          const totalScore = results.reduce((sum, r) => sum + (r.overall_score || 0), 0);
          avgScore = totalScore / results.length;

          // Calculate pass rate based on test version
          const passedCount = results.filter((r) => {
            const passingScore = r.test_version === "beginner" ? 336 : 448;
            return (r.overall_score || 0) >= passingScore;
          }).length;

          passRate = (passedCount / results.length) * 100;
        }

        return {
          product_slug: product.slug,
          product_name: product.name,
          track: product.track,
          total_tests: totalTests || 0,
          completed_tests: completedTests || 0,
          avg_score: avgScore,
          pass_rate: passRate,
          question_count: product.question_count,
          duration_minutes: product.duration_minutes,
          total_points: product.total_points,
          passing_score: product.passing_score,
          difficulty_level: product.difficulty_level,
        };
      });

      const allStats = await Promise.all(statsPromises);
      setStats(allStats);
    } catch (error) {
      console.error("Error fetching product stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackStats = {
    general: stats.filter((s) => s.track === "general"),
    adolescent: stats.filter((s) => s.track === "adolescent"),
    "role-based": stats.filter((s) => s.track === "role-based"),
  };

  const getTrackBadgeColor = (track: string) => {
    switch (track) {
      case "general":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "adolescent":
        return "bg-green-100 text-green-800 border-green-200";
      case "role-based":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const totalTests = stats.reduce((sum, s) => sum + s.total_tests, 0);
  const totalCompleted = stats.reduce((sum, s) => sum + s.completed_tests, 0);
  const overallAvgScore =
    stats.reduce((sum, s) => sum + s.avg_score * s.completed_tests, 0) / totalCompleted || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <p className="text-2xl font-bold">{totalTests}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <p className="text-2xl font-bold">{totalCompleted}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTests > 0 ? ((totalCompleted / totalTests) * 100).toFixed(1) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <p className="text-2xl font-bold">{overallAvgScore.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-2xl font-bold">{stats.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Structure Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Test Structure & Configuration
          </CardTitle>
          <CardDescription>Item selection strategy and timing by assessment type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Group by track */}
            {Array.from(new Set(stats.map((s) => s.track))).map((track) => {
              const trackProducts = stats.filter((s) => s.track === track);
              return (
                <div key={track} className="space-y-3">
                  <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                    {track === "general" && "🌐"}
                    {track === "adolescent" && "🎓"}
                    {track === "role-based" && "💼"}
                    {track} Track
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {trackProducts.map((product) => {
                      const isAdaptive = product.difficulty_level === "advanced";
                      const isAdolescent = product.track === "adolescent";
                      return (
                        <Card key={product.product_slug} className="border-l-4 border-primary/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{product.product_name}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Type:</span>
                              <Badge variant="outline" className="text-xs">
                                {isAdaptive ? "IRT-Adaptive" : "Fixed"}
                              </Badge>
                            </div>
                            {isAdaptive && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Selection:</span>
                                <span className="font-medium">80 from 160 items</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Questions:</span>
                              <span className="font-medium">{product.question_count}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{product.duration_minutes} min</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Total Points:</span>
                              <span className="font-medium">{product.total_points}</span>
                            </div>
                            {product.passing_score && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Passing:</span>
                                <span className="font-medium">{product.passing_score} pts</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Track Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Products Analytics</CardTitle>
          <CardDescription>Performance metrics by track and product</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.length})</TabsTrigger>
              <TabsTrigger value="general">General ({trackStats.general.length})</TabsTrigger>
              <TabsTrigger value="adolescent">Student ({trackStats.adolescent.length})</TabsTrigger>
              <TabsTrigger value="role-based">Professional ({trackStats["role-based"].length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {stats
                .sort((a, b) => b.total_tests - a.total_tests)
                .map((stat) => (
                  <ProductStatCard key={stat.product_slug} stat={stat} getTrackBadgeColor={getTrackBadgeColor} />
                ))}
            </TabsContent>

            <TabsContent value="general" className="space-y-4 mt-4">
              {trackStats.general.map((stat) => (
                <ProductStatCard key={stat.product_slug} stat={stat} getTrackBadgeColor={getTrackBadgeColor} />
              ))}
            </TabsContent>

            <TabsContent value="adolescent" className="space-y-4 mt-4">
              {trackStats.adolescent.map((stat) => (
                <ProductStatCard key={stat.product_slug} stat={stat} getTrackBadgeColor={getTrackBadgeColor} />
              ))}
            </TabsContent>

            <TabsContent value="role-based" className="space-y-4 mt-4">
              {trackStats["role-based"]
                .sort((a, b) => b.total_tests - a.total_tests)
                .map((stat) => (
                  <ProductStatCard key={stat.product_slug} stat={stat} getTrackBadgeColor={getTrackBadgeColor} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductStatCard({
  stat,
  getTrackBadgeColor,
}: {
  stat: ProductStat;
  getTrackBadgeColor: (track: string) => string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm">{stat.product_name}</h4>
          <Badge variant="outline" className={`text-xs ${getTrackBadgeColor(stat.track)}`}>
            {stat.track === "role-based" ? "Professional" : stat.track === "adolescent" ? "Student" : "General"}
          </Badge>
        </div>
        <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground mt-2">
          <div>
            <span className="font-medium">Tests:</span> {stat.total_tests}
          </div>
          <div>
            <span className="font-medium">Completed:</span> {stat.completed_tests}
          </div>
          <div>
            <span className="font-medium">Avg Score:</span>{" "}
            {stat.completed_tests > 0 ? stat.avg_score.toFixed(1) : "N/A"}
          </div>
          <div>
            <span className="font-medium">Pass Rate:</span>{" "}
            {stat.completed_tests > 0 ? `${stat.pass_rate.toFixed(1)}%` : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}
