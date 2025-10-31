import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TrueFalseQuestionProps {
  questionKey: string;
  currentAnswer?: string;
  onAnswerChange: (questionKey: string, value: string, questionType: string) => void;
}

export const TrueFalseQuestion = ({ questionKey, currentAnswer, onAnswerChange }: TrueFalseQuestionProps) => {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={currentAnswer}
        onValueChange={(value) => onAnswerChange(questionKey, value, 'true-false')}
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
    </div>
  );
};
