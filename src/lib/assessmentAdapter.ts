/**
 * Assessment Adapter
 * Normalizes 4 different JSON formats into a unified structure:
 * - Standard Format (General, PM, DS, DM, BA, Sales, Ops, HR, Adolescent)
 * - SDE/Metadata Wrapper Format (SDE files)
 * - Direct ItemBank Array Format
 * - Hybrid Metadata with Direct ItemBank
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
    correctAnswer?: string | string[] | number | boolean;
    correctAnswers?: number[]; // For multiple-response questions
    explanation?: string;
    scenario?: string;
  }>;
}

export interface NormalizedAssessment {
  name: string;
  description: string;
  assessmentTier: string;
  assessmentType: 'fixed' | 'adaptive';
  totalTime: number;
  questionCount: number;
  totalAvailableItems?: number;
  dimensions: NormalizedDimension[];
  scoring?: {
    passingScore?: number;
    totalPoints?: number;
    dimensionWeights?: Record<string, number>;
    scoringGuidelines?: Record<string, string>;
  };
}

type FormatType = 'standard' | 'sde-metadata' | 'direct-array' | 'hybrid-metadata';

/**
 * Detect which JSON format is being used
 */
function detectFormatType(data: any): FormatType {
  if (!data || typeof data !== 'object') return 'standard';

  // Check for SDE/Metadata wrapper format
  if ('assessmentMetadata' in data) {
    const metadata = data.assessmentMetadata;
    
    // Check if itemBank is direct array or has dimensions
    if (data.itemBank && Array.isArray(data.itemBank)) {
      return 'hybrid-metadata';
    }
    
    if (metadata.dimensions || (data.itemBank && data.itemBank.dimensions)) {
      return 'sde-metadata';
    }
  }

  // Check for direct itemBank array (no dimensions wrapper)
  if (data.itemBank && Array.isArray(data.itemBank)) {
    return 'direct-array';
  }

  // Standard format with itemBank.dimensions
  return 'standard';
}

/**
 * Extract metadata from various format locations
 */
function extractMetadata(data: any, format: FormatType): any {
  const assessmentType = data.assessmentType || data.assessmentConfiguration?.assessmentType || 'fixed';
  
  switch (format) {
    case 'sde-metadata':
    case 'hybrid-metadata':
      const metadata = data.assessmentMetadata;
      return {
        name: metadata.name || metadata.title || 'Unknown Assessment',
        description: metadata.description || '',
        assessmentTier: metadata.assessmentTier || metadata.tier || 'beginner',
        assessmentType: assessmentType === 'adaptive-sequential' ? 'adaptive' : assessmentType,
        totalTime: extractDuration(data, format),
        scoring: {
          ...metadata.scoring,
          ...extractScoring(data),
          scoringGuidelines: data.scoringConfiguration?.scoringGuidelines || metadata.scoring?.scoringGuidelines,
        },
      };

    case 'standard':
    case 'direct-array':
    default:
      return {
        name: data.assessmentName || data.name || 'Unknown Assessment',
        description: data.description || '',
        assessmentTier: data.assessmentTier || data.tier || extractTierFromName(data.assessmentName || data.name),
        assessmentType: assessmentType === 'adaptive-sequential' ? 'adaptive' : assessmentType,
        totalTime: extractDuration(data, format),
        scoring: {
          ...data.scoringConfiguration,
          ...data.scoring,
          scoringGuidelines: data.scoringConfiguration?.scoringGuidelines,
        },
      };
  }
}

/**
 * Extract duration/time from various locations in the JSON
 */
function extractDuration(data: any, format: FormatType): number {
  // Try multiple possible locations
  const config = data.assessmentConfiguration || data.configuration || data.assessmentMetadata || data;
  
  // Check for direct totalTime field
  if (config.totalTime) return config.totalTime;
  
  // Check for estimatedTime string (e.g., "60 minutes")
  if (config.estimatedTime) {
    const match = String(config.estimatedTime).match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  
  // Check for duration field
  if (config.duration) {
    if (typeof config.duration === 'number') return config.duration;
    const match = String(config.duration).match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  
  // Default based on tier
  return 60;
}

/**
 * Extract tier from assessment name if not explicitly provided
 */
function extractTierFromName(name: string = ''): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('advanced') || lowerName.includes('expert')) return 'advanced';
  if (lowerName.includes('beginner') || lowerName.includes('foundational')) return 'beginner';
  return 'beginner';
}

/**
 * Extract scoring configuration from various locations
 */
function extractScoring(data: any): any {
  const scoring = data.scoringConfiguration || data.scoring || {};
  return {
    passingScore: scoring.passingScore,
    totalPoints: scoring.totalPoints,
    dimensionWeights: scoring.dimensionWeights,
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
 * Extract dimensions from various JSON structures
 */
function extractDimensions(data: any, format: FormatType): any[] {
  switch (format) {
    case 'sde-metadata':
      // SDE format: dimensions in assessmentMetadata or itemBank
      return data.assessmentMetadata?.dimensions || data.itemBank?.dimensions || [];

    case 'hybrid-metadata':
      // Hybrid: itemBank is direct array, need to group into dimensions
      // For now, treat entire array as one dimension
      return data.itemBank ? [{ items: data.itemBank }] : [];

    case 'direct-array':
      // Direct array: itemBank[] without dimensions wrapper
      return data.itemBank ? [{ items: data.itemBank }] : [];

    case 'standard':
    default:
      // Standard format: itemBank.dimensions[]
      return data.itemBank?.dimensions || [];
  }
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
    items: Array.isArray(dim.items) ? dim.items.map(item => {
      // Handle both single correctAnswer and multiple correctAnswers
      let correctAnswer = item.correctAnswer !== undefined ? item.correctAnswer : item.answer;
      
      // For multiple-response questions, use correctAnswers array
      if (item.correctAnswers && Array.isArray(item.correctAnswers)) {
        correctAnswer = item.correctAnswers;
      }
      
      return {
        id: item.id || item.itemId || '',
        text: item.text || item.question || item.questionText || '',
        type: item.type || item.questionType || 'multiple-choice',
        difficulty: item.difficulty || item.difficultyLevel,
        options: item.options || item.choices,
        correctAnswer,
        correctAnswers: item.correctAnswers, // Keep correctAnswers for multiple-response
        explanation: item.explanation || item.rationale,
        scenario: item.scenario,
      };
    }) : [],
  }));
}

/**
 * Main adapter function to normalize any assessment JSON format
 */
export function normalizeAssessmentData(rawData: any): NormalizedAssessment {
  // Detect format type
  const format = detectFormatType(rawData);
  
  // Extract metadata based on format
  const metadata = extractMetadata(rawData, format);
  
  // Extract dimensions based on format
  const rawDimensions = extractDimensions(rawData, format);
  
  // Normalize dimensions structure
  const dimensions = normalizeDimensions(rawDimensions);
  
  // Count total available items
  const totalAvailableItems = countQuestions(dimensions);
  
  // For adaptive assessments, use configured target question count
  // For fixed assessments, question count = available items
  let questionCount = totalAvailableItems;
  if (metadata.assessmentType === 'adaptive') {
    const configuredCount = rawData.assessmentConfiguration?.totalQuestions || 
                           rawData.assessmentMetadata?.totalItems;
    if (configuredCount && configuredCount < totalAvailableItems) {
      questionCount = configuredCount;
    }
  }

  return {
    name: metadata.name,
    description: metadata.description,
    assessmentTier: metadata.assessmentTier,
    assessmentType: metadata.assessmentType,
    totalTime: metadata.totalTime,
    questionCount,
    totalAvailableItems,
    dimensions,
    scoring: metadata.scoring,
  };
}

/**
 * Load and normalize assessment securely from edge function
 */
export async function loadNormalizedAssessment(
  slug: string, 
  testId: string,
  supabaseClient: any
): Promise<NormalizedAssessment> {
  try {
    const { data, error } = await supabaseClient.functions.invoke('load-assessment', {
      body: { testId, productSlug: slug }
    });

    if (error) {
      console.error('Failed to load assessment from edge function', error);
      
      // Provide more specific error messages
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        throw new Error(
          `Assessment file "${slug}.json" not found in storage. Please contact support.`
        );
      }
      
      throw new Error(`Failed to load assessment: ${error.message || 'Unknown error'}`);
    }

    if (!data?.assessment) {
      throw new Error('Invalid assessment data received from server');
    }
    
    return normalizeAssessmentData(data.assessment);
  } catch (error) {
    console.error('Error loading assessment:', error);
    throw error;
  }
}

