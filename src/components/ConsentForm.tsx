import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";

interface ConsentFormProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

export const ConsentForm = ({ open, onConsent, onDecline }: ConsentFormProps) => {
  const [consentChecked, setConsentChecked] = useState(false);
  const [understandChecked, setUnderstandChecked] = useState(false);

  const canProceed = consentChecked && understandChecked;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Research Participation Consent</DialogTitle>
          <DialogDescription className="text-base">
            Please review and consent to participate in this research assessment
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* About the AIQ Assessment */}
            <section>
              <h3 className="font-semibold text-base mb-2">About the AIQ Assessment</h3>
              <p className="text-muted-foreground">
                The AIQ Assessment is a research-backed evaluation of AI collaboration skills. 
                This test uses Item Response Theory (IRT) methodology with 400 calibrated items 
                across 8 validated dimensions to measure real-world AI collaboration competencies.
              </p>
            </section>

            {/* Data Collection & Privacy */}
            <section>
              <h3 className="font-semibold text-base mb-3">Data Collection & Privacy</h3>
              
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2">Data We COLLECT (Anonymized):</h4>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>✓ Test responses and timing data</li>
                  <li>✓ Score patterns across dimensions</li>
                  <li>✓ Adaptive difficulty selections</li>
                  <li>✓ Aggregate performance metrics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Data We DO NOT COLLECT:</h4>
                <ul className="space-y-1 text-muted-foreground ml-4">
                  <li>✗ Your name or personal identifiers</li>
                  <li>✗ Contact information (email, phone)</li>
                  <li>✗ Employment or demographic details</li>
                  <li>✗ IP addresses or tracking cookies</li>
                </ul>
              </div>
            </section>

            {/* How Your Data Will Be Used */}
            <section>
              <h3 className="font-semibold text-base mb-2">How Your Data Will Be Used</h3>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Psychometric validation and test refinement</li>
                <li>• Research on AI collaboration competencies</li>
                <li>• Aggregate analysis for normative data</li>
                <li>• Published research (fully anonymized)</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h3 className="font-semibold text-base mb-2">Your Rights</h3>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Participation is completely voluntary</li>
                <li>• You may withdraw consent at any time</li>
                <li>• Results are yours to share as you choose</li>
                <li>• No penalty for declining participation</li>
              </ul>
            </section>

            {/* Research Foundation */}
            <section>
              <h3 className="font-semibold text-base mb-2">Research Foundation</h3>
              <p className="text-muted-foreground italic">
                "This assessment is based on peer-reviewed research into AI collaboration skills, 
                incorporating Item Response Theory (IRT) with 400 calibrated items across 8 validated 
                dimensions. Discrimination parameters: 0.44-0.79. Difficulty parameters calibrated 
                across 3 proficiency levels."
              </p>
            </section>

            {/* Consent Checkboxes */}
            <section className="space-y-4 pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                />
                <Label htmlFor="consent" className="text-sm font-normal leading-relaxed cursor-pointer">
                  I consent to my anonymized test data being used for research purposes as described above
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understand"
                  checked={understandChecked}
                  onCheckedChange={(checked) => setUnderstandChecked(checked as boolean)}
                />
                <Label htmlFor="understand" className="text-sm font-normal leading-relaxed cursor-pointer">
                  I understand my data will be anonymized and used only for research purposes
                </Label>
              </div>
            </section>

            {!canProceed && (
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Please check both boxes above to proceed with the assessment
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button onClick={onConsent} disabled={!canProceed}>
            Agree and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
