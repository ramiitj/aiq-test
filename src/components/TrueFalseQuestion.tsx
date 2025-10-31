import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TrueFalseQuestionProps {
  questionKey: string;
  currentAnswer?: string;
  onAnswerChange: (questionKey: string, value: string, questionType: string) => void;
}

export const TrueFalseQuestion = ({ questionKey, currentAnswer, onAnswerChange }: TrueFalseQuestionProps) => {
  const [showHint, setShowHint] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (currentAnswer) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [questionKey, currentAnswer]);

  const handleValueSelect = (value: string) => {
    setPendingValue(value);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (pendingValue) {
      setShowHint(false);
      onAnswerChange(questionKey, pendingValue, 'true-false');
    }
    setShowConfirmDialog(false);
    setPendingValue(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingValue(null);
  };

  return (
    <div className="space-y-4">
      {showHint && currentAnswer && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-900 dark:text-blue-100">
            You previously selected: <strong>{currentAnswer === 'true' ? 'True' : 'False'}</strong>. 
            Click same or different to proceed.
          </span>
        </div>
      )}
      
      <RadioGroup
        value={currentAnswer}
        onValueChange={handleValueSelect}
        className="space-y-3"
      >
        <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-all">
          <RadioGroupItem value="true" id={`${questionKey}-true`} />
          <Label htmlFor={`${questionKey}-true`} className="flex-1 cursor-pointer text-base">True</Label>
        </div>
        <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-all">
          <RadioGroupItem value="false" id={`${questionKey}-false`} />
          <Label htmlFor={`${questionKey}-false`} className="flex-1 cursor-pointer text-base">False</Label>
        </div>
      </RadioGroup>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Answer</AlertDialogTitle>
            <AlertDialogDescription>
              You selected <strong>{pendingValue === 'true' ? 'True' : 'False'}</strong>. 
              Are you sure you want to proceed with this answer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
