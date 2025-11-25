import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ItemStats {
  itemId: string;
  usageCount: number;
  difficulty: number;
  discrimination: number;
  dimensionCode: string;
}

interface TestStats {
  testId: string;
  avgDifficulty: number;
  avgDiscrimination: number;
  itemCount: number;
  completedAt: string;
  productSlug: string;
}

interface DimensionDistribution {
  dimensionCode: string;
  dimensionName: string;
  itemCount: number;
  avgDifficulty: number;
  avgDiscrimination: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function AdminIRTAnalytics() {
  const [loading, setLoading] = useState(true);
  const [itemStats, setItemStats] = useState<ItemStats[]>([]);
  const [testStats, setTestStats] = useState<TestStats[]>([]);
  const [dimensionDist, setDimensionDist] = useState<DimensionDistribution[]>([]);
  const [totalTests, setTotalTests] = useState(0);

  useEffect(() => {
    fetchIRTStatistics();
  }, []);

  const fetchIRTStatistics = async () => {
    try {
      setLoading(true);

      // Fetch all completed general-advanced tests
      const { data: tests, error } = await supabase
        .from('tests')
        .select('id, answers, completed, end_time, product_slug')
        .eq('product_slug', 'general-advanced')
        .eq('completed', true)
        .order('end_time', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (!tests || tests.length === 0) {
        setLoading(false);
        return;
      }

      setTotalTests(tests.length);

      // Load general-advanced assessment to get item metadata
      const response = await fetch('/test-items/general-advanced.json');
      const assessmentData = await response.json();
      
      // Build item metadata map
      const itemMetadata = new Map<string, { difficulty: number; discrimination: number; dimensionCode: string; dimensionName: string }>();
      
      if (assessmentData.itemBank && Array.isArray(assessmentData.itemBank)) {
        assessmentData.itemBank.forEach((dimension: any) => {
          if (dimension.items && Array.isArray(dimension.items)) {
            dimension.items.forEach((item: any) => {
              itemMetadata.set(item.id, {
                difficulty: item.difficulty || 0.5,
                discrimination: item.discrimination || 1.0,
                dimensionCode: dimension.dimensionCode || '',
                dimensionName: dimension.dimensionName || ''
              });
            });
          }
        });
      }

      // Analyze item usage frequency
      const itemUsageMap = new Map<string, number>();
      const testStatsData: TestStats[] = [];
      const dimensionStats = new Map<string, { name: string; totalDiff: number; totalDisc: number; count: number }>();

      tests.forEach((test) => {
        const answers = test.answers as Record<string, any>;
        const itemIds = Object.keys(answers);
        
        let totalDiff = 0;
        let totalDisc = 0;
        let validItemCount = 0;

        itemIds.forEach((itemId) => {
          // Count usage
          itemUsageMap.set(itemId, (itemUsageMap.get(itemId) || 0) + 1);

          // Get metadata
          const metadata = itemMetadata.get(itemId);
          if (metadata) {
            totalDiff += metadata.difficulty;
            totalDisc += metadata.discrimination;
            validItemCount++;

            // Track dimension stats
            const dimKey = metadata.dimensionCode;
            if (!dimensionStats.has(dimKey)) {
              dimensionStats.set(dimKey, {
                name: metadata.dimensionName,
                totalDiff: 0,
                totalDisc: 0,
                count: 0
              });
            }
            const dimStat = dimensionStats.get(dimKey)!;
            dimStat.totalDiff += metadata.difficulty;
            dimStat.totalDisc += metadata.discrimination;
            dimStat.count++;
          }
        });

        testStatsData.push({
          testId: test.id,
          avgDifficulty: validItemCount > 0 ? totalDiff / validItemCount : 0,
          avgDiscrimination: validItemCount > 0 ? totalDisc / validItemCount : 0,
          itemCount: itemIds.length,
          completedAt: test.end_time || '',
          productSlug: test.product_slug || 'general-advanced'
        });
      });

      // Convert to array and sort by usage
      const itemStatsArray: ItemStats[] = Array.from(itemUsageMap.entries())
        .map(([itemId, count]) => {
          const metadata = itemMetadata.get(itemId);
          return {
            itemId,
            usageCount: count,
            difficulty: metadata?.difficulty || 0,
            discrimination: metadata?.discrimination || 0,
            dimensionCode: metadata?.dimensionCode || 'Unknown'
          };
        })
        .sort((a, b) => b.usageCount - a.usageCount);

      // Build dimension distribution
      const dimensionDistArray: DimensionDistribution[] = Array.from(dimensionStats.entries())
        .map(([code, stats]) => ({
          dimensionCode: code,
          dimensionName: stats.name,
          itemCount: stats.count,
          avgDifficulty: stats.count > 0 ? stats.totalDiff / stats.count : 0,
          avgDiscrimination: stats.count > 0 ? stats.totalDisc / stats.count : 0
        }))
        .sort((a, b) => a.dimensionCode.localeCompare(b.dimensionCode));

      setItemStats(itemStatsArray);
      setTestStats(testStatsData);
      setDimensionDist(dimensionDistArray);
    } catch (error) {
      console.error('Error fetching IRT statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (totalTests === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IRT Analytics</CardTitle>
          <CardDescription>No completed General Advanced tests found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const topItems = itemStats.slice(0, 20);
  const avgTestDifficulty = testStats.reduce((sum, t) => sum + t.avgDifficulty, 0) / testStats.length;
  const avgTestDiscrimination = testStats.reduce((sum, t) => sum + t.avgDiscrimination, 0) / testStats.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tests Analyzed</CardDescription>
            <CardTitle className="text-3xl">{totalTests}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">General Advanced</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Difficulty</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Target className="h-5 w-5 text-chart-1" />
              {avgTestDifficulty.toFixed(3)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Range: 0.0 - 1.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Discrimination</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-chart-2" />
              {avgTestDiscrimination.toFixed(3)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Range: 0.0 - 3.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Items Used</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-3" />
              {itemStats.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">From 160-item bank</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Item Usage</TabsTrigger>
          <TabsTrigger value="dimensions">Dimension Distribution</TabsTrigger>
          <TabsTrigger value="tests">Test Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Most Selected Items</CardTitle>
              <CardDescription>
                Item selection frequency from {totalTests} completed tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="itemId" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{data.itemId}</p>
                            <p className="text-sm text-muted-foreground">Dimension: {data.dimensionCode}</p>
                            <p className="text-sm">Usage: {data.usageCount} times</p>
                            <p className="text-sm">Difficulty: {data.difficulty.toFixed(3)}</p>
                            <p className="text-sm">Discrimination: {data.discrimination.toFixed(3)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="usageCount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selection Distribution by Dimension</CardTitle>
              <CardDescription>
                Average psychometric properties per dimension
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dimensionDist}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dimensionCode" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{data.dimensionName}</p>
                            <p className="text-sm">Code: {data.dimensionCode}</p>
                            <p className="text-sm">Total Selections: {data.itemCount}</p>
                            <p className="text-sm text-chart-1">Avg Difficulty: {data.avgDifficulty.toFixed(3)}</p>
                            <p className="text-sm text-chart-2">Avg Discrimination: {data.avgDiscrimination.toFixed(3)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="avgDifficulty" fill={COLORS[0]} name="Avg Difficulty" />
                  <Bar yAxisId="right" dataKey="avgDiscrimination" fill={COLORS[1]} name="Avg Discrimination" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Count by Dimension</CardTitle>
              <CardDescription>Total items selected per dimension across all tests</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dimensionDist}
                    dataKey="itemCount"
                    nameKey="dimensionCode"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ dimensionCode, percent }) => 
                      `${dimensionCode} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {dimensionDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Difficulty & Discrimination Trends</CardTitle>
              <CardDescription>
                Showing last {Math.min(50, testStats.length)} completed tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={testStats.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="testId" 
                    tick={false}
                    label={{ value: 'Test Sequence', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-xs">Test: {data.testId.slice(0, 8)}...</p>
                            <p className="text-sm">Items: {data.itemCount}</p>
                            <p className="text-sm text-chart-1">Avg Difficulty: {data.avgDifficulty.toFixed(3)}</p>
                            <p className="text-sm text-chart-2">Avg Discrimination: {data.avgDiscrimination.toFixed(3)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgDifficulty" 
                    stroke={COLORS[0]} 
                    name="Avg Difficulty"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgDiscrimination" 
                    stroke={COLORS[1]} 
                    name="Avg Discrimination"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
