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

  const canProceed = consentChecked;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Informed Consent for Research Participation</DialogTitle>
          <DialogDescription className="text-base">
            Please read carefully and provide your consent to participate
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">Purpose of Study</h3>
              <p className="text-muted-foreground">
                You are invited to participate in a research study examining AI collaboration competencies. 
                This assessment uses Item Response Theory methodology with calibrated items across multiple 
                dimensions to evaluate real-world AI collaboration skills.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Procedures</h3>
              <p className="text-muted-foreground">
                If you agree to participate, you will complete an adaptive assessment consisting of 
                approximately 80 questions across 8 dimensions. The assessment takes approximately 
                60 minutes to complete. Your responses will be recorded and analyzed for research purposes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Confidentiality and Data Use</h3>
              <p className="text-muted-foreground mb-2">
                All data collected will be completely anonymized. We will collect your test responses, 
                timing data, and performance patterns.
              </p>
              <p className="text-muted-foreground">
                Anonymized data will be used for psychometric validation, research on AI collaboration 
                competencies, aggregate analysis, and may be included in published research studies.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Voluntary Participation</h3>
              <p className="text-muted-foreground">
                Your participation is completely voluntary. You may withdraw at any time without penalty. 
                You may decline to answer any question. Your decision to participate or not will not 
                affect your access to the assessment results.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Risks and Benefits</h3>
              <p className="text-muted-foreground">
                There are no known risks associated with participation. Benefits include receiving 
                your individual assessment results and contributing to research that advances 
                understanding of AI collaboration competencies.
              </p>
            </section>

            <section className="pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                />
                <Label htmlFor="consent" className="text-sm font-normal leading-relaxed cursor-pointer">
                  I have read and understand the above information. I voluntarily agree to participate 
                  in this research study and consent to the collection and use of my anonymized data 
                  as described above.
                </Label>
              </div>
            </section>

            {!canProceed && (
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Please check the box above to provide your consent and proceed
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
