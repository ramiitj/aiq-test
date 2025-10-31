import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen animate-fade-in">
      <Navigation isAuthenticated={false} />
      
      <main className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>Data Collection and Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We collect and process personal data in accordance with GDPR and other applicable data protection laws.
            </p>
            
            <h3 className="font-semibold text-lg mt-6">What Data We Collect:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (for authentication)</li>
              <li>Name (optional, for profile)</li>
              <li>Test responses and scores</li>
              <li>Usage analytics and timestamps</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">How We Use Your Data:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve the AIQ Assessment service</li>
              <li>To generate your personalized test results</li>
              <li>To send you your test completion certificate</li>
              <li>To analyze aggregate usage patterns (anonymized)</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">Data Retention:</h3>
            <p>
              We retain your data for as long as your account is active. Shared test results 
              expire after 12 months. You can request deletion of your data at any time.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>Your Rights (GDPR Compliance)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Under GDPR, you have the following rights:</p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong>Right to Erasure:</strong> Delete your account and all associated data</li>
              <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Right to Withdraw Consent:</strong> Stop processing of your data at any time</li>
              <li><strong>Right to Object:</strong> Object to processing for direct marketing</li>
            </ul>

            <p className="mt-4">
              To exercise any of these rights, visit your Dashboard and use the data management 
              options, or contact us at privacy@aiqassessment.com.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Encrypted data storage</li>
              <li>Row-level security policies on database</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>

            <p className="mt-4">
              However, no method of transmission over the internet is 100% secure. While we 
              strive to protect your data, we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use the following third-party services that may process your data:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Lovable Cloud:</strong> Backend infrastructure and database hosting</li>
              <li><strong>Authentication Provider:</strong> Secure user authentication</li>
            </ul>

            <p className="mt-4">
              These services are GDPR-compliant and process data under our instructions.
            </p>

            <h3 className="font-semibold text-lg mt-6">Cookies and Tracking:</h3>
            <p>
              We use essential cookies for authentication and session management. We do not 
              use third-party tracking cookies or advertising networks.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br />
            <strong>Contact:</strong> privacy@aiq.works<br />
            Questions about this policy? Contact us at the email above.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
