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
    totalTime: 3600, // 60 minutes
    level1Count: 3,
    level2Count: 4,
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

    // Beginner version: items are already pre-selected
    if (version === 'beginner') {
      return data.dimensions as Dimension[];
    }

    // Professional/Expert: Need to handle different JSON structure
    // Note: The uploaded Professional/Expert JSONs appear to be incomplete
    // They show single dimensions. For now, we'll handle what we have.
    
    // Check if it's a single dimension object or array of dimensions
    if (Array.isArray(data)) {
      // Array of dimensions - ideal structure
      return data.map((dimension: Dimension) => ({
        ...dimension,
        items: selectItemsForDimension(dimension.items, config),
      }));
    } else if (data.dimensionCode && data.items) {
      // Single dimension object - wrap it in array
      // This is temporary until we have complete 8-dimension files
      return [
        {
          dimensionCode: data.dimensionCode,
          dimensionName: data.name || data.dimensionName,
          description: data.description,
          items: selectItemsForDimension(data.items, config),
        },
      ];
    } else if (data.dimensions) {
      // Has dimensions property
      return data.dimensions.map((dimension: Dimension) => ({
        ...dimension,
        items: selectItemsForDimension(dimension.items, config),
      }));
    }

    throw new Error(`Unexpected ${version} assessment format`);
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
  const totalQuestions = config.itemsPerDimension * 8; // 8 dimensions
  const timeMinutes = config.totalTime / 60;

  const descriptions = {
    beginner: 'Foundational AI literacy assessment for those new to AI',
    professional: 'Comprehensive assessment for AI practitioners',
    expert: 'Advanced assessment for AI experts and leaders',
  };

  const audiences = {
    beginner: 'Beginners and those new to AI',
    professional: 'Professionals actively using AI',
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
