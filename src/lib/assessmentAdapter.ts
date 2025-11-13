/**
 * Assessment Adapter
 * Normalizes different JSON formats (Standard and SDE) into a unified structure
 */

export interface NormalizedDimension {
  code: string;
  name: string;
  description: string;
  items: Array<{
    id: string;
    text: string;
    type: string;
    difficulty?: string;
    options?: string[];
    correctAnswer?: string | string[];
    explanation?: string;
    scenario?: string;
  }>;
}

export interface NormalizedAssessment {
  name: string;
  description: string;
  assessmentTier: string;
  totalTime: number;
  questionCount: number;
  dimensions: NormalizedDimension[];
  scoring?: {
    passingScore?: number;
    dimensionWeights?: Record<string, number>;
  };
}

/**
 * Detect if JSON uses SDE format (has assessmentMetadata wrapper)
 */
function isSdeFormat(data: any): boolean {
  return data && typeof data === 'object' && 'assessmentMetadata' in data;
}

/**
 * Normalize SDE format to standard format
 */
function normalizeSdeFormat(data: any): any {
  if (!isSdeFormat(data)) return data;

  const metadata = data.assessmentMetadata;
  
  return {
    name: metadata.name,
    description: metadata.description,
    assessmentTier: metadata.assessmentTier,
    totalTime: metadata.totalTime,
    dimensions: metadata.dimensions || [],
    scoring: metadata.scoring,
  };
}

/**
 * Count total questions across all dimensions
 */
function countQuestions(dimensions: any[]): number {
  if (!Array.isArray(dimensions)) return 0;
  return dimensions.reduce((total, dim) => {
    return total + (Array.isArray(dim.items) ? dim.items.length : 0);
  }, 0);
}

/**
 * Validate and normalize dimension structure
 */
function normalizeDimensions(dimensions: any[]): NormalizedDimension[] {
  if (!Array.isArray(dimensions)) return [];

  return dimensions.map(dim => ({
    code: dim.code || dim.dimensionCode || '',
    name: dim.name || dim.dimensionName || '',
    description: dim.description || '',
    items: Array.isArray(dim.items) ? dim.items.map(item => ({
      id: item.id || item.itemId || '',
      text: item.text || item.questionText || '',
      type: item.type || item.questionType || 'multiple_choice',
      difficulty: item.difficulty || item.difficultyLevel,
      options: item.options || item.choices,
      correctAnswer: item.correctAnswer || item.answer,
      explanation: item.explanation || item.rationale,
      scenario: item.scenario,
    })) : [],
  }));
}

/**
 * Main adapter function to normalize any assessment JSON format
 */
export function normalizeAssessmentData(rawData: any): NormalizedAssessment {
  // First, handle SDE format if needed
  const standardized = normalizeSdeFormat(rawData);

  // Extract dimensions
  const dimensions = normalizeDimensions(standardized.dimensions || []);
  
  // Count total questions
  const questionCount = countQuestions(dimensions);

  return {
    name: standardized.name || 'Unknown Assessment',
    description: standardized.description || '',
    assessmentTier: standardized.assessmentTier || 'beginner',
    totalTime: standardized.totalTime || 60,
    questionCount,
    dimensions,
    scoring: standardized.scoring,
  };
}

/**
 * Load and normalize assessment from file path
 */
export async function loadNormalizedAssessment(filePath: string): Promise<NormalizedAssessment> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load assessment: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    return normalizeAssessmentData(rawData);
  } catch (error) {
    console.error('Error loading assessment:', error);
    throw error;
  }
}

/**
 * Get assessment file path by slug
 */
export function getAssessmentFilePath(slug: string): string {
  return `/test-items/${slug}.json`;
}
