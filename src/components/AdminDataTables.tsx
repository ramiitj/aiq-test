import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Users, FileText, BarChart, PauseCircle } from "lucide-react";
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
  test_id: string;
  full_name: string;
  phone_number: string | null;
  country: string | null;
  job_role: string;
  organization_type: string;
  organization_size: string | null;
  industry_sector: string;
  years_experience: string;
  ai_familiarity: string;
  ai_usage_frequency: string;
  ai_training: string;
  ai_tools_used: any;
  ai_use_cases: any;
  assessment_tier: string;
  assessment_reasons: any;
  results_usage: any;
  age_range: string | null;
  education_level: string | null;
  primary_language: string | null;
  technical_background: string | null;
  consent_assessment: boolean;
  consent_data_usage: boolean;
  consent_results_access: boolean;
  consent_research: boolean | null;
  consent_communications: boolean | null;
  created_at: string;
}

interface PausedTest {
  id: string;
  user_id: string;
  test_version: string;
  current_dimension: number;
  current_item: number;
  paused: boolean;
  start_time: string;
  pause_timestamp: string | null;
  time_remaining: number | null;
  answers: any;
  dimension_states: any;
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
  test_duration_seconds: number | null;
  percentile_rank: number | null;
}

export const AdminDataTables = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [demographics, setDemographics] = useState<TestDemographics[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [pausedTests, setPausedTests] = useState<PausedTest[]>([]);
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

      // Fetch ALL demographics data (compulsory and optional)
      const { data: demographicsData, error: demographicsError } = await supabase
        .from("test_demographics")
        .select("*")
        .order("created_at", { ascending: false });

      if (demographicsError) throw demographicsError;

      // Fetch test results
      const { data: resultsData, error: resultsError } = await supabase
        .from("public_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (resultsError) throw resultsError;

      // Fetch paused/incomplete tests
      const { data: pausedTestsData, error: pausedError } = await supabase
        .from("tests")
        .select("*")
        .or("paused.eq.true,completed.eq.false")
        .order("created_at", { ascending: false });

      if (pausedError) throw pausedError;

      setProfiles(profilesData || []);
      setDemographics(demographicsData || []);
      setResults(resultsData || []);
      setPausedTests(pausedTestsData || []);
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
      "Phone": d.phone_number || "N/A",
      "Country": d.country || "N/A",
      "Job Role": d.job_role,
      "Organization Type": d.organization_type,
      "Organization Size": d.organization_size || "N/A",
      "Industry": d.industry_sector,
      "Years Experience": d.years_experience,
      "AI Familiarity": d.ai_familiarity,
      "AI Usage Frequency": d.ai_usage_frequency,
      "AI Training": d.ai_training,
      "AI Tools Used": JSON.stringify(d.ai_tools_used),
      "AI Use Cases": JSON.stringify(d.ai_use_cases),
      "Assessment Tier": d.assessment_tier,
      "Assessment Reasons": JSON.stringify(d.assessment_reasons),
      "Results Usage": JSON.stringify(d.results_usage),
      "Age Range": d.age_range || "N/A",
      "Education Level": d.education_level || "N/A",
      "Primary Language": d.primary_language || "N/A",
      "Technical Background": d.technical_background || "N/A",
      "Consent Assessment": d.consent_assessment ? "Yes" : "No",
      "Consent Data Usage": d.consent_data_usage ? "Yes" : "No",
      "Consent Results Access": d.consent_results_access ? "Yes" : "No",
      "Consent Research": d.consent_research ? "Yes" : "No",
      "Consent Communications": d.consent_communications ? "Yes" : "No",
      "Date": new Date(d.created_at).toLocaleDateString(),
    }));
    exportToExcel(exportData, "user_demographics_all");
  };

  const exportResults = () => {
    const exportData = results.map(r => ({
      "User Name": r.user_name || "N/A",
      "Test Version": r.test_version,
      "Overall Score": r.overall_score,
      "Duration (minutes)": r.test_duration_seconds 
        ? (r.test_duration_seconds / 60).toFixed(1) 
        : "N/A",
      "Percentile Rank": r.percentile_rank || "N/A",
      "Completion Date": r.test_completion_date 
        ? new Date(r.test_completion_date).toLocaleDateString() 
        : "N/A",
      "Dimensions": JSON.stringify(r.dimension_scores),
    }));
    exportToExcel(exportData, "test_results");
  };

  const exportPausedTests = () => {
    const exportData = pausedTests.map(t => ({
      "Test ID": t.id,
      "User ID": t.user_id,
      "Test Version": t.test_version,
      "Status": t.paused ? "Paused" : "In Progress",
      "Current Dimension": t.current_dimension,
      "Current Item": t.current_item,
      "Start Time": new Date(t.start_time).toLocaleString(),
      "Pause Time": t.pause_timestamp 
        ? new Date(t.pause_timestamp).toLocaleString() 
        : "N/A",
      "Time Remaining (seconds)": t.time_remaining || "N/A",
      "Answers Count": Array.isArray(t.answers) ? t.answers.length : 0,
      "Created At": new Date(t.created_at).toLocaleDateString(),
    }));
    exportToExcel(exportData, "paused_tests");
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
            View and export all user data including profiles, demographics (compulsory & optional), test results, and paused tests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="paused">
                <PauseCircle className="h-4 w-4 mr-2" />
                Paused ({pausedTests.length})
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
                  Showing all demographics data (compulsory & optional fields)
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
                        <TableHead>Phone</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Org Size</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>AI Familiarity</TableHead>
                        <TableHead>AI Usage</TableHead>
                        <TableHead>Assessment Tier</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Education</TableHead>
                        <TableHead>Data Consent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demographics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="text-center text-muted-foreground">
                            No demographics data found
                          </TableCell>
                        </TableRow>
                      ) : (
                        demographics.map((demo) => (
                          <TableRow key={demo.id}>
                            <TableCell className="font-medium">{demo.full_name}</TableCell>
                            <TableCell>{demo.phone_number || "N/A"}</TableCell>
                            <TableCell>{demo.country || "N/A"}</TableCell>
                            <TableCell>{demo.job_role}</TableCell>
                            <TableCell>{demo.industry_sector}</TableCell>
                            <TableCell>{demo.organization_size || "N/A"}</TableCell>
                            <TableCell>{demo.years_experience}</TableCell>
                            <TableCell>{demo.ai_familiarity}</TableCell>
                            <TableCell>{demo.ai_usage_frequency}</TableCell>
                            <TableCell className="capitalize">{demo.assessment_tier}</TableCell>
                            <TableCell>{demo.age_range || "N/A"}</TableCell>
                            <TableCell>{demo.education_level || "N/A"}</TableCell>
                            <TableCell>
                              <span className={demo.consent_data_usage ? "text-green-600" : "text-gray-500"}>
                                {demo.consent_data_usage ? "Yes" : "No"}
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
                        <TableHead>Duration</TableHead>
                        <TableHead>Percentile</TableHead>
                        <TableHead>Completion Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                              {result.test_duration_seconds 
                                ? `${(result.test_duration_seconds / 60).toFixed(1)} min` 
                                : "N/A"}
                            </TableCell>
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

            {/* Paused Tests Tab */}
            <TabsContent value="paused" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Tests that are paused or in progress
                </p>
                <Button onClick={exportPausedTests} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test ID</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Pause Time</TableHead>
                        <TableHead>Time Remaining</TableHead>
                        <TableHead>Answers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pausedTests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground">
                            No paused or in-progress tests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        pausedTests.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell className="font-mono text-xs">
                              {test.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="capitalize">{test.test_version}</TableCell>
                            <TableCell>
                              <span className={test.paused ? "text-yellow-600" : "text-blue-600"}>
                                {test.paused ? "Paused" : "In Progress"}
                              </span>
                            </TableCell>
                            <TableCell>
                              Dim {test.current_dimension}, Item {test.current_item}
                            </TableCell>
                            <TableCell className="text-xs">
                              {new Date(test.start_time).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs">
                              {test.pause_timestamp 
                                ? new Date(test.pause_timestamp).toLocaleString() 
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {test.time_remaining 
                                ? `${Math.floor(test.time_remaining / 60)}m ${test.time_remaining % 60}s` 
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {Array.isArray(test.answers) ? test.answers.length : 0}
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
