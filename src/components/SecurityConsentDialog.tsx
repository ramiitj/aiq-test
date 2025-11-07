import { useState } from 'react';
import { AlertTriangle, Shield, Lock, Eye, Wifi, MonitorOff, Ban, Search, Maximize, FileWarning } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityConsentDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  testVersion: string;
}

export const SecurityConsentDialog = ({ open, onAccept, onDecline }: SecurityConsentDialogProps) => {
  const [agreed, setAgreed] = useState(false);

  const securityMeasures = [
    { icon: Shield, text: 'AI assistants and chatbots will be blocked', color: 'text-amber-600' },
    { icon: Ban, text: 'Copy and paste operations will be disabled', color: 'text-amber-600' },
    { icon: Lock, text: 'Right-click context menu will be blocked', color: 'text-amber-600' },
    { icon: Eye, text: 'Tab switching and window changes will be monitored', color: 'text-amber-600' },
    { icon: Search, text: 'Developer tools detection is active', color: 'text-amber-600' },
    { icon: Wifi, text: 'Network requests to AI APIs will be blocked', color: 'text-amber-600' },
    { icon: MonitorOff, text: 'Browser extensions will be monitored', color: 'text-amber-600' },
    { icon: Maximize, text: 'Fullscreen mode will be enforced (desktop)', color: 'text-amber-600' },
    { icon: FileWarning, text: 'All violations will be logged and recorded', color: 'text-red-600' },
    { icon: AlertTriangle, text: '3 violations will result in test termination', color: 'text-red-600' },
  ];

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-amber-600" />
            Security Agreement Required
          </DialogTitle>
          <DialogDescription className="text-base">
            Please read and accept the security measures before starting your assessment.
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            <strong>Important:</strong> This assessment uses comprehensive security monitoring to ensure integrity and prevent AI assistance. By proceeding, you consent to these measures.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 py-4">
          <h3 className="font-semibold text-lg mb-3">The following security measures will be active:</h3>
          
          {securityMeasures.map((measure, index) => {
            const Icon = measure.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${measure.color}`} />
                <p className="text-sm">{measure.text}</p>
              </div>
            );
          })}
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Consequences of Violations:</strong>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Each violation will be logged with a timestamp</li>
              <li>You will receive a warning notification for each violation</li>
              <li>After 3 violations, your assessment will be automatically terminated</li>
              <li>Terminated assessments cannot be resumed and will be marked in your record</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
          <Checkbox
            id="security-agreement"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <label
            htmlFor="security-agreement"
            className="text-sm font-medium leading-relaxed cursor-pointer"
          >
            I understand and accept all security measures listed above. I confirm that I will not use any AI assistants, external tools, or attempt to circumvent these security measures during the assessment. I understand that violations will be logged and may result in test termination.
          </label>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onDecline}
          >
            Decline & Exit
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={!agreed}
            className="bg-amber-600 hover:bg-amber-700"
          >
            I Understand and Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
