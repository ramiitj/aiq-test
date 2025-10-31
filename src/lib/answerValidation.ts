import { z } from 'zod';

/**
 * Enhanced answer validation for complex question types
 * Prevents malformed data, index out-of-bounds, and injection attacks
 */

export interface QuestionData {
  type: string;
  options?: string[];
  items?: any[];
  leftColumn?: any[];
  rightColumn?: any[];
}

/**
 * Validate answer format and bounds for a specific question type
 */
export const validateAnswerForQuestion = (
  answer: string,
  questionType: string,
  questionData: QuestionData
): { valid: boolean; error?: string } => {
  
  if (!answer || typeof answer !== 'string') {
    return { valid: false, error: 'Answer is required' };
  }

  // Trim and validate max length
  if (answer.length > 5000) {
    return { valid: false, error: 'Answer exceeds maximum length' };
  }

  switch (questionType) {
    case 'multiple-choice':
    case 'scenario-based':
      const choiceIndex = parseInt(answer, 10);
      if (isNaN(choiceIndex)) {
        return { valid: false, error: 'Answer must be a number' };
      }
      const maxOptions = questionData.options?.length || 0;
      if (choiceIndex < 0 || choiceIndex >= maxOptions) {
        return { valid: false, error: `Invalid option index (must be 0-${maxOptions - 1})` };
      }
      break;
      
    case 'true-false':
      if (answer !== 'true' && answer !== 'false') {
        return { valid: false, error: 'Must be true or false' };
      }
      break;
      
    case 'multiple-response':
      const indices = answer.split(',').map(s => s.trim());
      const maxIndex = questionData.options?.length || 0;
      
      for (const indexStr of indices) {
        const idx = parseInt(indexStr, 10);
        if (isNaN(idx) || idx < 0 || idx >= maxIndex) {
          return { valid: false, error: `Invalid option index: ${indexStr}` };
        }
      }
      
      // Check for duplicates
      const uniqueIndices = new Set(indices);
      if (uniqueIndices.size !== indices.length) {
        return { valid: false, error: 'Duplicate selections not allowed' };
      }
      break;
      
    case 'scenario-ranking':
    case 'rank-ordering':
      const ranks = answer.split(',').map(s => s.trim());
      const expectedLength = questionData.options?.length || questionData.items?.length || 0;
      
      if (ranks.length !== expectedLength) {
        return { valid: false, error: `Must rank all ${expectedLength} items` };
      }
      
      // Convert to numbers and validate
      const rankNumbers = ranks.map(r => parseInt(r, 10));
      if (rankNumbers.some(isNaN)) {
        return { valid: false, error: 'Rankings must be numbers' };
      }
      
      // Check that all numbers 0 to expectedLength-1 are present exactly once
      const sorted = [...rankNumbers].sort((a, b) => a - b);
      for (let i = 0; i < expectedLength; i++) {
        if (sorted[i] !== i) {
          return { valid: false, error: 'Invalid ranking sequence (must use each position once)' };
        }
      }
      break;
      
    case 'matching':
      const pairs = answer.split(',').map(s => s.trim());
      const leftMax = questionData.leftColumn?.length || 0;
      const rightMax = questionData.rightColumn?.length || 0;
      
      if (pairs.length !== leftMax) {
        return { valid: false, error: `Must match all ${leftMax} items` };
      }
      
      for (const pairStr of pairs) {
        const [leftStr, rightStr] = pairStr.split(':');
        if (!leftStr || !rightStr) {
          return { valid: false, error: 'Invalid matching format (use leftIndex:rightIndex)' };
        }
        
        const left = parseInt(leftStr.trim(), 10);
        const right = parseInt(rightStr.trim(), 10);
        
        if (isNaN(left) || isNaN(right)) {
          return { valid: false, error: 'Matching indices must be numbers' };
        }
        
        if (left < 0 || left >= leftMax || right < 0 || right >= rightMax) {
          return { valid: false, error: `Invalid matching indices (left: 0-${leftMax - 1}, right: 0-${rightMax - 1})` };
        }
      }
      break;
      
    case 'text':
    case 'short-answer':
      // Text answers are limited to 500 characters for safety
      if (answer.length > 500) {
        return { valid: false, error: 'Text answer too long (max 500 characters)' };
      }
      // Check for potential HTML/script injection
      if (/<script|<iframe|javascript:/i.test(answer)) {
        return { valid: false, error: 'Invalid characters in answer' };
      }
      break;
      
    default:
      // Unknown question type - allow but log warning
      console.warn(`Unknown question type: ${questionType}`);
      break;
  }
  
  return { valid: true };
};

/**
 * Batch validate multiple answers
 */
export const validateAnswers = (
  answers: Record<string, string>,
  dimensions: any[]
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  for (const [key, answer] of Object.entries(answers)) {
    const [dimIdx, qIdx] = key.split('-').map(Number);
    
    if (isNaN(dimIdx) || isNaN(qIdx)) {
      errors[key] = 'Invalid answer key format';
      continue;
    }
    
    const dimension = dimensions[dimIdx];
    if (!dimension) {
      errors[key] = 'Invalid dimension index';
      continue;
    }
    
    const question = dimension.items?.[qIdx];
    if (!question) {
      errors[key] = 'Invalid question index';
      continue;
    }
    
    const validation = validateAnswerForQuestion(answer, question.type, question);
    if (!validation.valid) {
      errors[key] = validation.error || 'Invalid answer';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
