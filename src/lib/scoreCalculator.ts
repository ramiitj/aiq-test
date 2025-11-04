/**
 * Score Calculator for AIQ Assessment with IRT-Based Weighted Scoring
 * Calculates point-based scores with difficulty and discrimination weighting
 */

import type { Dimension, TestItem } from './adaptiveItemSelector';

interface Answer {
  [key: string]: string; // e.g., "0-0": "2" or "0-0": "1,3"
}

interface ScoringConfiguration {
  totalPoints: number;
  pointsPerDimension: number;
  passingScore: number;
  passingPercentage: number;
  minimumDimensionPercentage?: number; // Minimum percentage required per dimension (default: 40%)
  scoringMethod: {
    type: string;
    description: string;
    basePoints: number;
    formula: string;
  };
  scoringGuidelines: {
    [key: string]: string; // e.g., "0-40%": "Novice (0-240 points)"
  };
}

interface ScoringResult {
  dimensionScores: { [dimensionCode: string]: number }; // Points earned per dimension
  overallScore: number; // Total points earned
  totalPossiblePoints: number;
  passingScore: number;
  passed: boolean;
  percentageScore: number; // For display (overall score / total possible)
  correctCount: number;
  totalCount: number;
  assessmentLevel: string;
  scoringGuidelines: { [key: string]: string };
  performanceLevel: string; // Determined from scoring guidelines
  failedDimensions?: string[]; // Dimensions that didn't meet minimum percentage
  dimensionMinimumRequired?: number; // The minimum percentage required per dimension
}

/**
 * Calculate item points based on correctness and assessment level
 */
function calculateItemPoints(
  item: TestItem,
  isCorrect: boolean,
  assessmentLevel: string
): number {
  if (!isCorrect) return 0;

  const basePoints = item.points || 10;
  const difficulty = item.difficulty || 0.5;
  const discrimination = item.discrimination || 1.0;
  const c_param = (item as any).c_param || 0.2; // Guessing parameter for expert level

  switch (assessmentLevel) {
    case 'beginner':
      // Simple difficulty weighting
      return basePoints * (1 + difficulty * 0.3);
    
    case 'professional':
      // IRT-weighted: difficulty + discrimination
      return basePoints * (1 + difficulty * 0.4 + discrimination * 0.2);
    
    case 'expert':
      // Advanced IRT: Updated formula from v5.0
      return basePoints * (1 + difficulty * 0.5 + discrimination * 0.25);
    
    default:
      return basePoints;
  }
}

/**
 * Determine performance level from percentage score and guidelines
 */
function determinePerformanceLevel(
  percentageScore: number,
  guidelines: { [key: string]: string }
): string {
  for (const [range, description] of Object.entries(guidelines)) {
    const [min, max] = range.split('-').map(s => parseInt(s.replace('%', '')));
    if (percentageScore >= min && percentageScore <= max) {
      // Extract level name from description (e.g., "Novice (0-240 points)" -> "Novice")
      const match = description.match(/^([^(]+)/);
      return match ? match[1].trim() : description;
    }
  }
  return 'Emerging';
}

/**
 * Calculate test scores based on answers and dimensions with IRT weighting
 * Normalizes final scores to match JSON-configured totalPoints
 */
export function calculateTestScores(
  answers: Answer,
  dimensions: Dimension[],
  scoringConfig: ScoringConfiguration,
  assessmentLevel: string = 'professional'
): ScoringResult {
  const dimensionScores: { [dimensionCode: string]: number } = {};
  let totalCorrect = 0;
  let totalQuestions = 0;
  let totalWeightedPoints = 0;
  let totalWeightedPossible = 0;

  // Process each dimension
  dimensions.forEach((dimension, dimIndex) => {
    let dimensionWeightedPoints = 0;
    let dimensionWeightedPossible = 0;

    // Process each item in the dimension
    dimension.items.forEach((item, itemIndex) => {
      const questionKey = `${dimIndex}-${itemIndex}`;
      const userAnswer = answers[questionKey];

      // Calculate max weighted points for this item
      const maxWeightedPoints = calculateItemPoints(item, true, assessmentLevel);
      dimensionWeightedPossible += maxWeightedPoints;
      totalWeightedPossible += maxWeightedPoints;

      if (userAnswer !== undefined) {
        totalQuestions++;

        // Check if answer is correct
        const isCorrect = checkAnswer(item, userAnswer);
        
        if (isCorrect) {
          totalCorrect++;
          
          // Calculate weighted points for correct answer
          const weightedPoints = calculateItemPoints(item, isCorrect, assessmentLevel);
          dimensionWeightedPoints += weightedPoints;
          totalWeightedPoints += weightedPoints;
        }
      }
    });

    // Normalize dimension score to configured pointsPerDimension
    const dimensionPercentage = dimensionWeightedPossible > 0 
      ? dimensionWeightedPoints / dimensionWeightedPossible 
      : 0;
    const normalizedDimensionScore = dimensionPercentage * scoringConfig.pointsPerDimension;
    
    dimensionScores[dimension.dimensionCode] = Math.round(normalizedDimensionScore * 10) / 10;
  });

  // Calculate percentage score
  const percentageScore = totalWeightedPossible > 0 
    ? (totalWeightedPoints / totalWeightedPossible) * 100 
    : 0;

  // Normalize overall score to configured totalPoints
  const normalizedOverallScore = (percentageScore / 100) * scoringConfig.totalPoints;

  // Determine if passed based on configured passing percentage
  const passed = percentageScore >= scoringConfig.passingPercentage;

  // Check minimum dimension requirements
  const minimumDimensionPercentage = scoringConfig.minimumDimensionPercentage || 40;
  const failedDimensions: string[] = [];
  
  dimensions.forEach((dimension) => {
    const dimScore = dimensionScores[dimension.dimensionCode];
    const dimPercentage = (dimScore / scoringConfig.pointsPerDimension) * 100;
    
    if (dimPercentage < minimumDimensionPercentage) {
      failedDimensions.push(dimension.dimensionCode);
    }
  });
  
  // Override pass status if any dimension fails minimum
  const passedDimensionMinimums = failedDimensions.length === 0;
  const finalPassed = passed && passedDimensionMinimums;

  // Determine performance level
  const performanceLevel = determinePerformanceLevel(percentageScore, scoringConfig.scoringGuidelines);

  return {
    dimensionScores,
    overallScore: Math.round(normalizedOverallScore * 10) / 10, // Normalized to JSON config
    totalPossiblePoints: scoringConfig.totalPoints, // Use JSON configured total
    passingScore: Math.round((scoringConfig.totalPoints * scoringConfig.passingPercentage / 100) * 10) / 10,
    passed: finalPassed,
    percentageScore: Math.round(percentageScore * 10) / 10,
    correctCount: totalCorrect,
    totalCount: totalQuestions,
    assessmentLevel,
    scoringGuidelines: scoringConfig.scoringGuidelines,
    performanceLevel,
    failedDimensions: failedDimensions.length > 0 ? failedDimensions : undefined,
    dimensionMinimumRequired: minimumDimensionPercentage,
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
