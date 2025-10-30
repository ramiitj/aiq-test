/**
 * Score Calculator for AIQ Assessment
 * Calculates scores based on user answers and correct answers from test items
 */

import type { Dimension, TestItem } from './adaptiveItemSelector';

interface Answer {
  [key: string]: string; // e.g., "0-0": "2" or "0-0": "1,3"
}

interface ScoringResult {
  dimensionScores: { [dimensionCode: string]: number };
  overallScore: number;
  correctCount: number;
  totalCount: number;
}

/**
 * Calculate test scores based on answers and dimensions
 */
export function calculateTestScores(
  answers: Answer,
  dimensions: Dimension[]
): ScoringResult {
  const dimensionScores: { [dimensionCode: string]: number } = {};
  let totalCorrect = 0;
  let totalQuestions = 0;

  // Process each dimension
  dimensions.forEach((dimension, dimIndex) => {
    let dimensionCorrect = 0;
    let dimensionTotal = 0;

    // Process each item in the dimension
    dimension.items.forEach((item, itemIndex) => {
      const questionKey = `${dimIndex}-${itemIndex}`;
      const userAnswer = answers[questionKey];

      if (userAnswer !== undefined) {
        dimensionTotal++;
        totalQuestions++;

        // Check if answer is correct based on question type
        const isCorrect = checkAnswer(item, userAnswer);
        
        if (isCorrect) {
          dimensionCorrect++;
          totalCorrect++;
        }
      }
    });

    // Calculate percentage for this dimension
    const dimensionPercentage = dimensionTotal > 0 
      ? (dimensionCorrect / dimensionTotal) * 100 
      : 0;
    
    dimensionScores[dimension.dimensionCode] = Math.round(dimensionPercentage * 10) / 10; // Round to 1 decimal
  });

  // Calculate overall score
  const overallScore = totalQuestions > 0 
    ? (totalCorrect / totalQuestions) * 100 
    : 0;

  return {
    dimensionScores,
    overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal
    correctCount: totalCorrect,
    totalCount: totalQuestions,
  };
}

/**
 * Check if a user's answer is correct for a given item
 */
function checkAnswer(item: TestItem, userAnswer: string): boolean {
  // Handle true-false questions
  if (item.type === 'true-false') {
    // correctAnswer can be boolean or number for true-false
    const correctValue = typeof item.correctAnswer === 'boolean' 
      ? (item.correctAnswer ? 'true' : 'false')
      : String(item.correctAnswer);
    return userAnswer === correctValue;
  }

  // Handle multiple-response questions (checkboxes)
  // User must select ALL correct answers and NO incorrect answers
  if (item.type === 'multiple-response' && item.correctAnswers) {
    const userSelectedIndices = userAnswer.split(',').filter(Boolean).sort();
    const correctIndices = item.correctAnswers.map(String).sort();
    
    // Must match exactly (all correct answers selected, no incorrect ones)
    return JSON.stringify(userSelectedIndices) === JSON.stringify(correctIndices);
  }

  // Handle multiple-choice and scenario-based questions (single selection)
  if ((item.type === 'multiple-choice' || item.type === 'scenario-based') && item.correctAnswer !== undefined) {
    return userAnswer === String(item.correctAnswer);
  }

  // If we can't determine correctness, consider it incorrect
  return false;
}
