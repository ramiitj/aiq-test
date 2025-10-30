/**
 * Adaptive Item Selection for Professional and Expert Assessments
 * Randomly selects items from large item pools while maintaining
 * difficulty balance and ensuring diversity
 */

export interface TestItem {
  id: string;
  level: number;
  type: 'multiple-choice' | 'true-false' | 'scenario-based' | 'multiple-response' | 'scenario-ranking' | 'matching' | 'rank-ordering';
  dimension?: string;
  dimensionCode?: string;
  points: number;
  difficulty: number;
  question: string;
  format?: string;
  
  // For multiple-choice, true-false, scenario-based, multiple-response
  options?: string[];
  correctAnswer?: number | boolean;
  
  // For multiple-response (checkboxes)
  correctAnswers?: number[];
  
  // For scenario-ranking and rank-ordering
  correctOrder?: number[];
  
  // IMPORTANT: 
  // - rank-ordering uses `items` property
  // - scenario-ranking uses `options` property
  items?: string[]; // For rank-ordering only
  
  // For matching
  leftColumn?: string[];
  rightColumn?: string[];
  correctPairs?: [number, number][];
  
  // Scoring
  scoringMethod?: string;
  scoringLogic?: string;
  
  // Metadata
  rationale?: string;
  explanation?: string;
  expectedLength?: string;
  scoringRubric?: any;
  partialCredit?: any;
  bloomLevel?: string;
  discrimination?: number;
  tags?: string[];
}

export interface Dimension {
  dimensionCode: string;
  dimensionName: string;
  description: string;
  items: TestItem[];
  questionsInAssessment?: number;
  pointsAvailable?: number;
}

export type TestVersion = 'beginner' | 'professional' | 'expert';

export interface VersionConfig {
  itemsPerDimension: number;
  totalTime: number; // in seconds
  totalPoints: number;
  pointsPerDimension: number;
  level1Count: number; // easy items
  level2Count: number; // medium items
  level3Count: number; // hard items
}

const VERSION_CONFIGS: Record<TestVersion, VersionConfig> = {
  beginner: {
    itemsPerDimension: 8,
    totalTime: 5400, // 90 minutes
    totalPoints: 600,
    pointsPerDimension: 75,
    level1Count: 3,
    level2Count: 3,
    level3Count: 2,
  },
  professional: {
    itemsPerDimension: 10,
    totalTime: 7200, // 120 minutes
    totalPoints: 800,
    pointsPerDimension: 100,
    level1Count: 4,
    level2Count: 3,
    level3Count: 3,
  },
  expert: {
    itemsPerDimension: 10,
    totalTime: 9000, // 150 minutes
    totalPoints: 800,
    pointsPerDimension: 100,
    level1Count: 4,
    level2Count: 3,
    level3Count: 3,
  },
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select random items from a pool based on difficulty distribution
 * Uses difficulty-based tiering instead of fixed level filtering
 */
export function selectItemsForDimension(
  items: TestItem[],
  config: VersionConfig
): TestItem[] {
  if (items.length === 0) return [];
  
  // Sort by difficulty to divide into tiers
  const sortedItems = [...items].sort((a, b) => a.difficulty - b.difficulty);
  
  const totalItems = sortedItems.length;
  const itemsToSelect = config.itemsPerDimension;
  
  // Divide into three difficulty tiers
  const tierSize = Math.floor(totalItems / 3);
  const easyTier = sortedItems.slice(0, tierSize);
  const mediumTier = sortedItems.slice(tierSize, tierSize * 2);
  const hardTier = sortedItems.slice(tierSize * 2);
  
  // Select proportionally from each tier based on config
  const selectedItems: TestItem[] = [];
  
  const easyItems = shuffleArray(easyTier).slice(0, config.level1Count);
  const mediumItems = shuffleArray(mediumTier).slice(0, config.level2Count);
  const hardItems = shuffleArray(hardTier).slice(0, config.level3Count);
  
  selectedItems.push(...easyItems, ...mediumItems, ...hardItems);
  
  // Sort selected items by difficulty for progressive difficulty
  return selectedItems.sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * Get configuration for a test version
 */
export function getVersionConfig(version: TestVersion): VersionConfig {
  return VERSION_CONFIGS[version];
}

/**
 * Load and prepare test items based on version
 */
export async function loadTestItems(version: TestVersion): Promise<Dimension[]> {
  try {
    const fileName = `${version}-assessment.json`;
    
    // First try to load from Supabase Storage
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: fileData, error: storageError } = await supabase.storage
      .from("aiq-items")
      .download(fileName);

    let data;
    
    if (storageError || !fileData) {
      // Fallback to public folder if file not in storage
      console.log(`Loading ${version} from public folder (storage error: ${storageError?.message})`);
      const response = await fetch(`/test-items/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${version} assessment from both storage and public folder`);
      }
      
      data = await response.json();
    } else {
      // Parse file from storage
      const text = await fileData.text();
      data = JSON.parse(text);
    }

    const config = getVersionConfig(version);

    // Extract dimensions from itemBank structure
    let dimensions;
    if (data.itemBank && data.itemBank.dimensions) {
      dimensions = data.itemBank.dimensions;
    } else if (data.dimensions) {
      // Fallback for older format
      dimensions = data.dimensions;
    } else {
      throw new Error(`Invalid assessment format: missing itemBank.dimensions or dimensions array`);
    }

    // Beginner version: Pre-selected items in dimensions array
    if (version === 'beginner') {
      return dimensions.map((dimension: any, idx: number) => ({
        dimensionCode: dimension.dimensionCode || dimension.id || `D${idx + 1}`,
        dimensionName: dimension.dimensionName || dimension.name || dimension.title || dimension.dimension || `Dimension ${idx + 1}`,
        description: dimension.description || '',
        items: dimension.items,
        questionsInAssessment: dimension.questionsInAssessment,
        pointsAvailable: dimension.pointsAvailable,
      }));
    }

    // Professional/Expert: Select items from larger item pool
    return dimensions.map((dimension: any, idx: number) => ({
      dimensionCode: dimension.dimensionCode || dimension.id || `D${idx + 1}`,
      dimensionName: dimension.dimensionName || dimension.name || dimension.title || dimension.dimension || `Dimension ${idx + 1}`,
      description: dimension.description || '',
      items: selectItemsForDimension(dimension.items, config),
    }));
  } catch (error) {
    console.error(`Error loading ${version} test items:`, error);
    throw error;
  }
}

/**
 * Get display information for a version
 */
export function getVersionInfo(version: TestVersion) {
  const config = getVersionConfig(version);
  
  // Calculate total questions based on actual structure
  let totalQuestions: number;
  if (version === 'beginner') {
    totalQuestions = 60; // 8 items per dimension × 8 dimensions
  } else if (version === 'professional') {
    totalQuestions = 80; // 10 items per dimension × 8 dimensions
  } else { // expert
    totalQuestions = 80; // 10 items selected from 20 per dimension × 8 dimensions
  }
  
  const timeMinutes = config.totalTime / 60;

  const descriptions = {
    beginner: 'Foundational AI literacy assessment for those new to AI (60 items across 8 dimensions)',
    professional: 'Comprehensive assessment for AI practitioners (80 items adaptively selected from 160-item pool)',
    expert: 'Advanced assessment for AI experts and leaders (80 items adaptively selected from 160-item pool)',
  };

  const audiences = {
    beginner: 'Beginners and those new to AI',
    professional: 'Professionals actively using AI in their work',
    expert: 'AI experts, leaders, and advanced practitioners',
  };

  return {
    version,
    totalQuestions,
    timeMinutes,
    description: descriptions[version],
    audience: audiences[version],
    config,
  };
}
