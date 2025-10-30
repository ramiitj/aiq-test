import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { loadTestItems, TestVersion, Dimension, TestItem } from "@/lib/adaptiveItemSelector";

// Utility to parse question text into main and list items
function parseQuestionText(text: string) {
  const listPattern = /^(?:\d+\.|[a-zA-Z]\)|\([a-zA-Z]\)|[a-zA-Z]\.)\s/;
  const lines = text.split('\n').filter(line => line.trim());
  const mainQuestion = [];
  const listItems = [];
  for (const line of lines) {
    if (listPattern.test(line.trim())) listItems.push(line.trim());
    else mainQuestion.push(line);
  }
  return { main: mainQuestion.join(' '), items: listItems };
}

const calculateScore = (item: TestItem, answer: string): number => {
  if (!answer) return 0;
  switch (item.type) {
    case "multiple-choice":
    case "scenario-based":
      return parseInt(answer) === item.correctAnswer ? item.points : 0;
    case "true-false":
      return (answer === "true") === item.correctAnswer ? item.points : 0;
    case "multiple-response": {
      const selected = answer.split(',').map(Number).sort();
      const correct = (item.correctAnswers || []).sort();
      return selected.length === correct.length && selected.every((v, idx) => v === correct[idx]) ? item.points : 0;
    }
    case "scenario-ranking":
    case "rank-ordering": {
      const order = answer.split(',').map(Number);
      const correct = item.correctOrder || [];
      return order.length === correct.length && order.every((v, idx) => v === correct[idx]) ? item.points : 0;
    }
    case "matching": {
      const pairs = answer.split(',').map(p => p.split('-').map(Number));
      const correct = item.correctPairs || [];
      let correctCount = 0;
      pairs.forEach(([l, r]) => { if (correct.some(([cl, cr]) => cl === l && cr === r)) correctCount++; });
      return Math.round((item.points * correctCount) / (correct.length || 1));
    }
    default: return 0;
  }
};

// ---- MAIN COMPONENT ----
const Test = ({ version = "professional" }: { version?: TestVersion }) => {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    loadTestItems(version).then(data => {
      setDimensions(data.dimensions);
      setLoading(false);
    });
  }, [version]);

  const totalQuestions = dimensions?.reduce((sum, dim) => sum + (dim.items?.length ?? 0), 0) ?? 0;
  const globalQuestionNumber =
    (dimensions?.slice(0, currentDimension).reduce((sum, dim) => sum + (dim.items?.length ?? 0), 0) ?? 0) +
    currentQuestion + 1;
  const isLastQuestion = globalQuestionNumber === totalQuestions;

  const advanceToNextQuestion = () => {
    if (currentQuestion < (dimensions[currentDimension]?.items?.length ?? 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentDimension < dimensions.length - 1) {
      setCurrentDimension(currentDimension + 1);
      setCurrentQuestion(0);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
    else if (currentDimension > 0) {
      setCurrentDimension(currentDimension - 1);
      setCurrentQuestion(dimensions[currentDimension - 1].items.length - 1);
    }
  };

  const currentItem = dimensions?.[currentDimension]?.items?.[currentQuestion] || null;
  const questionKey = `${currentDimension}-${currentQuestion}`;
  const currentAnswer = answers[questionKey];
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading assessment...</div>;
  }
  
  if (!dimensions || dimensions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">No assessment data available.</div>;
  }

  const handleAnswerAndAdvance = (value: string) => {
    setAnswers(prev => ({ ...prev, [questionKey]: value }));
    if (
      currentItem?.type === "multiple-choice" ||
      currentItem?.type === "true-false" ||
      currentItem?.type === "scenario-based"
    ) setTimeout(advanceToNextQuestion, 300);
  };

  // RESPONSE HANDLERS
  const renderRadio = (options: string[]) => (
    <RadioGroup
      value={currentAnswer ?? ""}
      onValueChange={val => handleAnswerAndAdvance(val)}
      className="space-y-3"
    >
      {options.map((option, idx) => (
        <div key={idx} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
          <RadioGroupItem value={String(idx)} id={`radio-${idx}`} />
          <Label htmlFor={`radio-${idx}`} className="flex-1 cursor-pointer">{option}</Label>
        </div>
      ))}
    </RadioGroup>
  );
  const renderTrueFalse = () => (
    <RadioGroup
      value={currentAnswer ?? ""}
      onValueChange={val => handleAnswerAndAdvance(val)}
      className="space-y-3"
    >
      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
        <RadioGroupItem value="true" id="true" />
        <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
      </div>
      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
        <RadioGroupItem value="false" id="false" />
        <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
      </div>
    </RadioGroup>
  );
  const renderMultipleResponse = (options: string[]) => {
    const selectedIndices = currentAnswer ? currentAnswer.split(',').map(Number) : [];
    const handleCheckboxChange = (idx: number, checked: boolean) => {
      let newIndices = [...selectedIndices];
      if (checked) newIndices.push(idx);
      else newIndices = newIndices.filter(i => i !== idx);
      newIndices.sort((a, b) => a - b);
      setAnswers(prev => ({ ...prev, [questionKey]: newIndices.join(',') }));
    };
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-900 mb-3">SELECT ALL that apply:</p>
        {options.map((option, idx) => (
          <div key={idx} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50">
            <Checkbox
              id={`option-${idx}`}
              checked={selectedIndices.includes(idx)}
              onCheckedChange={checked => handleCheckboxChange(idx, checked as boolean)}
            />
            <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer leading-relaxed">{option}</Label>
          </div>
        ))}
        <Button className="mt-4" disabled={selectedIndices.length === 0} onClick={advanceToNextQuestion}>Continue</Button>
      </div>
    );
  };
  const renderScenarioRanking = (options: string[]) => {
    const order = currentAnswer ? currentAnswer.split(',').map(Number) : [];
    const handleOrderChange = (idx: number, value: string) => {
      let newOrder = [...order];
      const pos = parseInt(value) - 1;
      newOrder[pos] = idx;
      setAnswers(prev => ({ ...prev, [questionKey]: newOrder.join(',') }));
    };
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-900 mb-3">Arrange these items in the correct sequence (1 = first):</p>
        {options.map((option, idx) => (
          <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
            <Select
              value={order.indexOf(idx) >= 0 ? (order.indexOf(idx) + 1).toString() : ""}
              onValueChange={val => handleOrderChange(idx, val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                {options.map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="flex-1 text-sm">{option}</span>
          </div>
        ))}
        <Button className="mt-4" disabled={order.length !== options.length} onClick={advanceToNextQuestion}>Next</Button>
      </div>
    );
  };
  const renderMatching = (leftColumn: string[], rightColumn: string[]) => {
    const pairs = currentAnswer ? currentAnswer.split(',').map(p => p.split('-').map(Number)) : [];
    const handleMatchChange = (lIdx: number, rIdxStr: string) => {
      let newPairs = pairs.filter(p => p[0] !== lIdx);
      newPairs.push([lIdx, parseInt(rIdxStr)]);
      newPairs.sort((a, b) => a[0] - b[0]);
      setAnswers(prev => ({ ...prev, [questionKey]: newPairs.map(p => p.join('-')).join(',') }));
    };
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-900 mb-3">Match each item from the left with the right:</p>
        {leftColumn.map((leftItem, idx) => (
          <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
            <span className="flex-1 text-sm font-medium">{leftItem}</span>
            <span className="text-muted-foreground">→</span>
            <Select
              value={pairs.find(p => p[0] === idx)?.[1]?.toString() || ""}
              onValueChange={val => handleMatchChange(idx, val)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select match" />
              </SelectTrigger>
              <SelectContent>
                {rightColumn.map((rightItem, i) => (
                  <SelectItem key={i} value={i.toString()}>{rightItem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <Button className="mt-4" disabled={pairs.length !== leftColumn.length} onClick={advanceToNextQuestion}>Next</Button>
      </div>
    );
  };
  const renderRankOrdering = (items: string[]) => {
    const order = currentAnswer ? currentAnswer.split(',').map(Number) : [];
    const handleOrderChange = (idx: number, value: string) => {
      let newOrder = [...order];
      const pos = parseInt(value) - 1;
      newOrder[pos] = idx;
      setAnswers(prev => ({ ...prev, [questionKey]: newOrder.join(',') }));
    };
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-blue-900 mb-3">Rank these by importance (1 = most):</p>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
            <Select
              value={order.indexOf(idx) >= 0 ? (order.indexOf(idx) + 1).toString() : ""}
              onValueChange={val => handleOrderChange(idx, val)}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Rank" />
              </SelectTrigger>
              <SelectContent>
                {items.map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>{i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="flex-1 text-sm">{item}</span>
          </div>
        ))}
        <Button className="mt-4" disabled={order.length !== items.length} onClick={advanceToNextQuestion}>Next</Button>
      </div>
    );
  };
  const renderTextBox = () => (
    <div className="space-y-3">
      <Input
        value={currentAnswer ?? ""}
        onChange={e => setAnswers(prev => ({ ...prev, [questionKey]: e.target.value }))}
        placeholder="Type your response here..."
      />
      <Button
        className="mt-4"
        disabled={!currentAnswer || currentAnswer.trim() === ""}
        onClick={advanceToNextQuestion}
      >Next Question</Button>
    </div>
  );

  const handleSubmitTest = () => {
    let totalScore = 0;
    dimensions?.forEach((dim, dIdx) => {
      dim.items.forEach((item, qIdx) => {
        const key = `${dIdx}-${qIdx}`;
        totalScore += calculateScore(item, answers[key]);
      });
    });
    setScore(totalScore);
    // If saving to backend, place API call here
  };

  // MAIN OUTPUT
  const { main, items: listItems } = currentItem ? parseQuestionText(currentItem.question) : { main: "", items: [] };

  if (score !== null) {
    // Results view
    const totalPoints = dimensions?.reduce((sum, dim) => sum + (dim.items?.reduce((t, i) => t + (i.points || 0), 0) ?? 0), 0) ?? 0;
    return (
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">Assessment Complete!</h2>
          <p className="mb-4 font-semibold">Your raw score: {score} / {totalPoints}</p>
          {/* Add more result breakdowns/statistics here */}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Progress value={(globalQuestionNumber / totalQuestions) * 100} />
        <div className="space-y-4 mb-4">
          <div className="text-lg font-semibold">{main}</div>
          {listItems.length > 0 && (
            <ul className="space-y-2 ml-4">
              {listItems.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">{item}</li>
              ))}
            </ul>
          )}
        </div>
        {currentItem?.type === "multiple-choice" && renderRadio(currentItem.options || [])}
        {currentItem?.type === "scenario-based" && renderRadio(currentItem.options || [])}
        {currentItem?.type === "true-false" && renderTrueFalse()}
        {currentItem?.type === "multiple-response" && renderMultipleResponse(currentItem.options || [])}
        {currentItem?.type === "scenario-ranking" && renderScenarioRanking(currentItem.options || [])}
        {currentItem?.type === "matching" && renderMatching(currentItem.leftColumn || [], currentItem.rightColumn || [])}
        {currentItem?.type === "rank-ordering" && renderRankOrdering(currentItem.items || [])}
        {currentItem?.type === "open-ended" && renderTextBox()}

        <div className="flex mt-4 gap-3">
          <Button onClick={goToPreviousQuestion}>Previous</Button>
          {isLastQuestion && (
            <Button onClick={handleSubmitTest}>Submit Assessment</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Test;