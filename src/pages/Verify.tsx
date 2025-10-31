import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Search, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  valid: boolean;
  issueDate?: string;
  expiryDate?: string;
  scoreRange?: string;
  level?: string;
  userName?: string;
  testDuration?: string;
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
      const { data, error } = await supabase.functions.invoke("verify-certificate", {
        body: { shareCode: code },
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
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navigation isAuthenticated={false} />

      <main>
        {/* Hero Section */}
        <section className="container py-24 text-center max-w-5xl">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1]">
            Certificate Verification
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Verify the authenticity of AIQ<sup className="text-[0.6em]">™</sup> Assessment certificates issued to participants
          </p>
        </section>

        {/* Verification Input Section */}
        {!urlCode && (
          <section className="container max-w-2xl mb-20">
            <Card className="shadow-sm border">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Enter Verification Code</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="AIQ-2025-XXXX"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                    className="flex-1 text-lg py-6"
                  />
                  <Button
                    onClick={handleVerify}
                    disabled={loading}
                    size="lg"
                    className="px-8 bg-blue-900 hover:bg-blue-800"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Results Section */}
        {result && (
          <section className="container max-w-4xl pb-20">
            {result.valid ? (
              // Valid Certificate Display
              <div className="space-y-8">
                {/* Success Header */}
                <div className="text-center">
                  <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-6" />
                  <h2 className="text-4xl font-bold mb-4 text-green-600 dark:text-green-400">✓ Valid Certificate</h2>
                  <p className="text-lg text-muted-foreground">
                    This AIQ<sup className="text-[0.6em]">™</sup> Assessment certificate has been verified as authentic
                  </p>
                </div>

                {/* Certificate Details */}
                <Card className="border-2 border-green-500 shadow-md">
                  <CardContent className="pt-8 pb-8">
                    {result.userName && (
                      <div className="text-center pb-8 border-b mb-8">
                        <p className="text-sm text-muted-foreground mb-2">Certificate Holder</p>
                        <p className="text-3xl font-bold">{result.userName}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-secondary/30 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Proficiency Level</p>
                        <p className="text-2xl font-bold text-primary">{result.level}</p>
                      </div>

                      <div className="bg-secondary/30 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Score Range</p>
                        <p className="text-2xl font-bold text-primary">{result.scoreRange}</p>
                      </div>

                      <div className="bg-secondary/30 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Issue Date</p>
                        <p className="text-xl font-semibold">{result.issueDate}</p>
                      </div>

                      <div className="bg-secondary/30 p-6 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Valid Until</p>
                        <p className="text-xl font-semibold">{result.expiryDate}</p>
                      </div>

                      {result.testDuration && (
                        <div className="bg-secondary/30 p-6 rounded-lg md:col-span-2">
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Test Duration</p>
                          <p className="text-xl font-semibold">{result.testDuration}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Notice */}
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 text-lg">
                    Certificate Authenticity Confirmed
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    This certificate has been verified as authentic and was issued by the AIQ<sup className="text-[0.6em]">™</sup> Assessment system. The
                    certificate holder has successfully completed the assessment and demonstrated proficiency in AI
                    collaboration skills. Exact scores are confidential and available only to the certificate holder.
                  </p>
                </div>

                {/* CTA Section */}
                <div className="text-center pt-8">
                  <p className="text-lg text-muted-foreground mb-6">Want to assess your own AI collaboration skills?</p>
                  <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Button size="lg" className="text-lg px-10 py-6 bg-blue-900 hover:bg-blue-800">
                      Take the AIQ<sup className="text-[0.6em]">™</sup> Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              // Invalid Certificate Display
              <div className="space-y-8">
                {/* Error Header */}
                <div className="text-center">
                  <XCircle className="h-24 w-24 text-destructive mx-auto mb-6" />
                  <h2 className="text-4xl font-bold mb-4 text-destructive">✗ Invalid Certificate</h2>
                  <p className="text-lg text-muted-foreground">The verification code could not be validated</p>
                </div>

                {/* Error Details */}
                <Card className="border-2 border-destructive shadow-sm">
                  <CardContent className="pt-8 pb-8">
                    <p className="text-center text-muted-foreground mb-8 text-lg">
                      This verification code is either invalid or the certificate has expired.
                    </p>

                    <div className="bg-secondary/30 rounded-lg p-6">
                      <p className="font-semibold mb-4">Possible reasons:</p>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-3">
                          <span className="text-destructive mt-1">•</span>
                          <span>The code was entered incorrectly</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-destructive mt-1">•</span>
                          <span>The certificate has expired (certificates are valid for 12 months)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-destructive mt-1">•</span>
                          <span>The code does not exist in our system</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Section */}
                <div className="text-center pt-4">
                  <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                      Take the AIQ<sup className="text-[0.6em]">™</sup> Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Info Section */}
        {!result && (
          <section className="bg-secondary/30 py-20">
            <div className="container max-w-4xl">
              <h2 className="text-3xl font-bold text-center mb-6">About Certificate Verification</h2>
              <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed max-w-2xl mx-auto">
                Each AIQ<sup className="text-[0.6em]">™</sup> Assessment certificate includes a unique verification code that can be used to confirm its
                authenticity and view key details about the achievement.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-card p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-primary mb-2">Secure</div>
                  <p className="text-sm text-muted-foreground">Cryptographically verified codes</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-primary mb-2">Valid</div>
                  <p className="text-sm text-muted-foreground">12 months from issue date</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-primary mb-2">Instant</div>
                  <p className="text-sm text-muted-foreground">Real-time verification</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Verify;
