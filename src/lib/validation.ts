import { z } from 'zod';

/**
 * Validation schemas for test answers
 * Prevents malformed data, excessive input, and potential injection attacks
 */

// Single answer validation - supports text, single choice, and multiple choice
export const answerValueSchema = z.union([
  z.string().max(5000, "Answer text cannot exceed 5000 characters"), // Text answers
  z.string().regex(/^\d+$/, "Single choice must be a number"), // Single choice: numeric string
  z.string().regex(/^\d+(,\d+)*$/, "Multiple choice must be comma-separated numbers"), // Multiple choice
]);

// Individual answer record validation
export const answerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: answerValueSchema,
  timestamp: z.string().datetime().optional(),
});

// Full answers object validation (keyed by question ID)
export const answersSchema = z.record(z.string(), z.any());

/**
 * Validate test answers before submission
 * @param answers - The answers object to validate
 * @returns Validation result with parsed data or error
 */
export const validateAnswers = (answers: Record<string, any>) => {
  try {
    answersSchema.parse(answers);
    
    // Additional validation: check individual answer values
    for (const [questionId, answer] of Object.entries(answers)) {
      if (typeof answer === 'string') {
        // Validate string length
        if (answer.length > 5000) {
          return {
            success: false,
            error: `Answer for question ${questionId} exceeds maximum length of 5000 characters`,
          };
        }
      }
    }
    
    return { success: true, data: answers };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid answer format",
      };
    }
    return { success: false, error: "Unknown validation error" };
  }
};
