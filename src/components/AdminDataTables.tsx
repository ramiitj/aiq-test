import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Users, FileText, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  country: string | null;
  city: string | null;
}

interface TestDemographics {
  id: string;
  user_id: string;
  full_name: string;
  job_role: string;
  industry_sector: string;
  organization_type: string;
  ai_familiarity: string;
  ai_usage_frequency: string;
  consent_data_usage: boolean;
  consent_research: boolean;
  created_at: string;
}

interface TestResult {
  id: string;
  user_id: string;
  user_name: string | null;
  test_version: string;
  overall_score: number;
  dimension_scores: any;
  test_completion_date: string | null;
  percentile_rank: number | null;
}

export const AdminDataTables = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [demographics, setDemographics] = useState<TestDemographics[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch demographics data (only where users consented to data usage)
      const { data: demographicsData, error: demographicsError } = await supabase
        .from("test_demographics")
        .select("*")
        .eq("consent_data_usage", true)
        .order("created_at", { ascending: false });

      if (demographicsError) throw demographicsError;

      // Fetch test results
      const { data: resultsData, error: resultsError } = await supabase
        .from("public_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (resultsError) throw resultsError;

      setProfiles(profilesData || []);
      setDemographics(demographicsData || []);
      setResults(resultsData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: `${filename} has been downloaded.`,
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportProfiles = () => {
    const exportData = profiles.map(p => ({
      Email: p.email,
      Name: p.name || "N/A",
      Country: p.country || "N/A",
      City: p.city || "N/A",
      "Registration Date": new Date(p.created_at).toLocaleDateString(),
    }));
    exportToExcel(exportData, "user_profiles");
  };

  const exportDemographics = () => {
    const exportData = demographics.map(d => ({
      "Full Name": d.full_name,
      "Job Role": d.job_role,
      "Industry": d.industry_sector,
      "Organization Type": d.organization_type,
      "AI Familiarity": d.ai_familiarity,
      "AI Usage Frequency": d.ai_usage_frequency,
      "Consented to Research": d.consent_research ? "Yes" : "No",
      "Date": new Date(d.created_at).toLocaleDateString(),
    }));
    exportToExcel(exportData, "user_demographics_consented");
  };

  const exportResults = () => {
    const exportData = results.map(r => ({
      "User Name": r.user_name || "N/A",
      "Test Version": r.test_version,
      "Overall Score": r.overall_score,
      "Percentile Rank": r.percentile_rank || "N/A",
      "Completion Date": r.test_completion_date 
        ? new Date(r.test_completion_date).toLocaleDateString() 
        : "N/A",
      "Dimensions": JSON.stringify(r.dimension_scores),
    }));
    exportToExcel(exportData, "test_results");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Data Management</CardTitle>
          <CardDescription>
            View and export user data. Demographics data is filtered to show only users who consented to data usage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profiles">
                <Users className="h-4 w-4 mr-2" />
                Profiles ({profiles.length})
              </TabsTrigger>
              <TabsTrigger value="demographics">
                <FileText className="h-4 w-4 mr-2" />
                Demographics ({demographics.length})
              </TabsTrigger>
              <TabsTrigger value="results">
                <BarChart className="h-4 w-4 mr-2" />
                Results ({results.length})
              </TabsTrigger>
            </TabsList>

            {/* Profiles Tab */}
            <TabsContent value="profiles" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={exportProfiles} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Registration Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.email}</TableCell>
                            <TableCell>{profile.name || "N/A"}</TableCell>
                            <TableCell>{profile.country || "N/A"}</TableCell>
                            <TableCell>{profile.city || "N/A"}</TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Demographics Tab */}
            <TabsContent value="demographics" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Showing only users who consented to data usage
                </p>
                <Button onClick={exportDemographics} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>AI Familiarity</TableHead>
                        <TableHead>AI Usage</TableHead>
                        <TableHead>Research Consent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demographics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No consented demographics data found
                          </TableCell>
                        </TableRow>
                      ) : (
                        demographics.map((demo) => (
                          <TableRow key={demo.id}>
                            <TableCell className="font-medium">{demo.full_name}</TableCell>
                            <TableCell>{demo.job_role}</TableCell>
                            <TableCell>{demo.industry_sector}</TableCell>
                            <TableCell>{demo.ai_familiarity}</TableCell>
                            <TableCell>{demo.ai_usage_frequency}</TableCell>
                            <TableCell>
                              <span className={demo.consent_research ? "text-green-600" : "text-gray-500"}>
                                {demo.consent_research ? "Yes" : "No"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Overall Score</TableHead>
                        <TableHead>Percentile</TableHead>
                        <TableHead>Completion Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No test results found
                          </TableCell>
                        </TableRow>
                      ) : (
                        results.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">
                              {result.user_name || "N/A"}
                            </TableCell>
                            <TableCell className="capitalize">{result.test_version}</TableCell>
                            <TableCell>{result.overall_score.toFixed(2)}</TableCell>
                            <TableCell>
                              {result.percentile_rank 
                                ? `${result.percentile_rank.toFixed(1)}%` 
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {result.test_completion_date
                                ? new Date(result.test_completion_date).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
