/**
 * Adaptive Item Selection for Professional and Expert Assessments
 * Randomly selects items from large item pools while maintaining
 * difficulty balance and ensuring diversity
 */

export interface TestItem {
  id: string;
  level: number;
  type: string;
  dimension?: string;
  dimensionCode?: string;
  points: number;
  difficulty: number;
  question: string;
  format?: string;
  options?: string[];
  correctAnswer?: number | boolean;
  correctAnswers?: number[];
  rationale?: string;
  explanation?: string;
  expectedLength?: string;
  scoringRubric?: any;
  partialCredit?: any;
  bloomLevel?: string;
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
  level1Count: number; // easy items
  level2Count: number; // medium items
  level3Count: number; // hard items
}

const VERSION_CONFIGS: Record<TestVersion, VersionConfig> = {
  beginner: {
    itemsPerDimension: 3,
    totalTime: 900, // 15 minutes
    level1Count: 1,
    level2Count: 1,
    level3Count: 1,
  },
  professional: {
    itemsPerDimension: 10,
    totalTime: 3600, // 60 minutes
    level1Count: 4,
    level2Count: 3,
    level3Count: 3,
  },
  expert: {
    itemsPerDimension: 10,
    totalTime: 3600, // 60 minutes (80 items total: 10 per dimension × 8 dimensions)
    level1Count: 4, // ~40% of items at foundational level
    level2Count: 3, // ~30% at application level
    level3Count: 3, // ~30% at evaluation level
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
 * Select random items from a pool based on level distribution
 */
export function selectItemsForDimension(
  items: TestItem[],
  config: VersionConfig
): TestItem[] {
  const level1Items = items.filter((item) => item.level === 1);
  const level2Items = items.filter((item) => item.level === 2);
  const level3Items = items.filter((item) => item.level === 3);

  const selectedItems: TestItem[] = [];

  // Randomly select items from each level
  const selectedLevel1 = shuffleArray(level1Items).slice(0, config.level1Count);
  const selectedLevel2 = shuffleArray(level2Items).slice(0, config.level2Count);
  const selectedLevel3 = shuffleArray(level3Items).slice(0, config.level3Count);

  selectedItems.push(...selectedLevel1, ...selectedLevel2, ...selectedLevel3);

  // Sort by difficulty to create progressive difficulty within dimension
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
      return dimensions.map((dimension: any) => ({
        dimensionCode: dimension.dimensionCode,
        dimensionName: dimension.dimensionName,
        description: dimension.description,
        items: dimension.items,
        questionsInAssessment: dimension.questionsInAssessment,
        pointsAvailable: dimension.pointsAvailable,
      }));
    }

    // Professional/Expert: Select items from larger item pool
    return dimensions.map((dimension: any) => ({
      dimensionCode: dimension.dimensionCode || dimension.id,
      dimensionName: dimension.dimensionName || dimension.name,
      description: dimension.description,
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
    totalQuestions = 24; // 3 items per dimension × 8 dimensions
  } else if (version === 'professional') {
    totalQuestions = 80; // 10 items per dimension × 8 dimensions
  } else { // expert
    totalQuestions = 80; // 10 items selected from 20 per dimension × 8 dimensions
  }
  
  const timeMinutes = config.totalTime / 60;

  const descriptions = {
    beginner: 'Foundational AI literacy assessment for those new to AI',
    professional: 'Comprehensive assessment for AI practitioners and professionals',
    expert: 'Advanced assessment for AI experts and leaders (80 items randomly selected from 160-item pool)',
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
