import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  valid: boolean;
  issueDate?: string;
  expiryDate?: string;
  scoreRange?: string;
  level?: string;
  userName?: string;
  testDuration?: string;
  percentile?: number;
}

const Verify = () => {
  const { code: urlCode } = useParams();
  const [inputCode, setInputCode] = useState(urlCode || "");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (urlCode) {
      verifyCode(urlCode);
    }
  }, [urlCode]);

  const verifyCode = async (code: string) => {
    setLoading(true);
    try {
      // Call Edge Function for secure server-side validation
      const { data, error } = await supabase.functions.invoke('verify-certificate', {
        body: { shareCode: code }
      });

      if (error) throw error;

      if (!data || !data.valid) {
        setResult({ valid: false });
        toast({
          title: "Invalid or Expired Code",
          description: "The verification code you entered is not valid or has expired.",
          variant: "destructive",
        });
        return;
      }

      setResult({
        valid: true,
        issueDate: new Date(data.issueDate).toLocaleDateString(),
        expiryDate: new Date(data.expiryDate).toLocaleDateString(),
        scoreRange: data.scoreRange,
        level: data.level,
        userName: data.userName,
        testDuration: data.testDuration,
        percentile: data.percentile,
      });
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (!inputCode.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a verification code",
        variant: "destructive",
      });
      return;
    }
    verifyCode(inputCode.trim());
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={false} />

      <main className="container py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
            Certificate Verification
          </h1>
          <p className="text-lg text-muted-foreground">
            Verify the authenticity of AIQ Assessment certificates
          </p>
        </div>

        {!urlCode && (
          <Card className="mb-8 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl">Enter Verification Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="AIQ-2025-XXXX"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  className="flex-1"
                />
                <Button onClick={handleVerify} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className={`shadow-elegant ${result.valid ? 'border-green-500' : 'border-destructive'}`}>
            <CardHeader className="text-center pb-6">
              {result.valid ? (
                <>
                  <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-green-500">
                    ✅ Valid AIQ Assessment Certificate
                  </CardTitle>
                </>
              ) : (
                <>
                  <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
                  <CardTitle className="text-2xl text-destructive">
                    ❌ Invalid or Expired Certificate
                  </CardTitle>
                </>
              )}
            </CardHeader>

            <CardContent>
              {result.valid ? (
                <div className="space-y-6">
                  {result.userName && (
                    <div className="text-center pb-4 border-b">
                      <p className="text-2xl font-bold">{result.userName}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Proficiency Level</p>
                      <p className="text-lg font-semibold">{result.level}</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Score Range</p>
                      <p className="text-lg font-semibold">{result.scoreRange}</p>
                    </div>

                    {result.percentile !== undefined && (
                      <div className="p-4 bg-muted rounded-lg col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">Percentile Ranking</p>
                        <p className="text-lg font-semibold">Top {(100 - result.percentile).toFixed(0)}% • {result.percentile.toFixed(1)}th Percentile</p>
                      </div>
                    )}

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                      <p className="text-lg font-semibold">{result.issueDate}</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Valid Until</p>
                      <p className="text-lg font-semibold">{result.expiryDate}</p>
                    </div>

                    {result.testDuration && (
                      <div className="p-4 bg-muted rounded-lg col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">Test Duration</p>
                        <p className="text-lg font-semibold">{result.testDuration}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Issued to: Verified AIQ Assessment Participant
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      This certificate has been verified as authentic and was issued by the AIQ Assessment system.
                      Exact scores are confidential and available only to the certificate holder.
                    </p>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Want to assess your own AI collaboration skills?
                    </p>
                    <Button asChild>
                      <a href="/">Take the AIQ Assessment</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <p className="text-muted-foreground">
                    This verification code is either invalid or the certificate has expired.
                  </p>

                  <div className="p-4 bg-muted rounded-lg text-left">
                    <p className="text-sm font-medium mb-2">Possible reasons:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• The code was entered incorrectly</li>
                      <li>• The certificate has expired (valid for 12 months)</li>
                      <li>• The code does not exist in our system</li>
                    </ul>
                  </div>

                  <Button asChild variant="outline">
                    <a href="/">Take the AIQ Assessment</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Verify;
