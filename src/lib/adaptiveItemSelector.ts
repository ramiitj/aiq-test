/**
 * Adaptive Item Selection for Professional and Expert Assessments
 * Randomly selects items from large item pools while maintaining
 * difficulty balance and ensuring diversity
 */

import { supabase } from "@/integrations/supabase/client";

export interface TestItem {
  id: string;
  level?: number; // Only for Beginner
  type: 'multiple-choice' | 'true-false' | 'multiple-response' | 'scenario-based';
  dimension?: string;
  dimensionCode?: string;
  points: number;
  difficulty: number;
  discrimination?: number;
  bloomLevel?: string;
  question: string;
  
  // For multiple-choice, multiple-response, and scenario-based
  options?: string[];
  
  // For multiple-choice, true-false, and scenario-based (single answer)
  correctAnswer?: number | boolean;
  
  // For multiple-response (multiple correct answers)
  correctAnswers?: number[];
  
  // Metadata
  explanation?: string;
  rationale?: string;
  scoringMethod?: string;
  tags?: string[];
}

export interface Dimension {
  dimensionCode: string;
  dimensionName: string;
  description?: string | null;
  items: TestItem[];
  questionsInAssessment?: number;
  pointsAvailable?: number;
  weight?: number;
  totalPoints?: number;
}

export type TestVersion = 'beginner' | 'professional' | 'expert';

export interface VersionConfig {
  itemsPerDimension: number;
  totalTime: number; // in minutes
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

const VERSION_CONFIGS: Record<TestVersion, VersionConfig> = {
  beginner: {
    itemsPerDimension: 8, // 8 fixed items per dimension (60 total questions)
    totalTime: 90, // 90 minutes
    easyCount: 4, // 50% of items (easier distribution)
    mediumCount: 3, // 37.5% of items
    hardCount: 1, // 12.5% of items
  },
  professional: {
    itemsPerDimension: 10, // Select 10 from 20 (80 total questions)
    totalTime: 120, // 120 minutes
    easyCount: 3, // 30% of items
    mediumCount: 4, // 40% of items
    hardCount: 3, // 30% of items
  },
  expert: {
    itemsPerDimension: 10, // Select 10 from 20 (80 total questions)
    totalTime: 150, // 150 minutes
    easyCount: 2, // 20% of items (harder distribution)
    mediumCount: 3, // 30% of items
    hardCount: 5, // 50% of items
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
 * Select items from a pool based on difficulty distribution
 * Uses difficulty-based tiering
 */
export function selectItemsForDimension(
  items: TestItem[],
  config: VersionConfig
): TestItem[] {
  if (items.length === 0) return [];
  
  // Sort by difficulty to divide into tiers
  const sortedItems = [...items].sort((a, b) => a.difficulty - b.difficulty);
  
  const totalItems = sortedItems.length;
  
  // Divide into three difficulty tiers
  const tierSize = Math.floor(totalItems / 3);
  const easyTier = sortedItems.slice(0, tierSize);
  const mediumTier = sortedItems.slice(tierSize, tierSize * 2);
  const hardTier = sortedItems.slice(tierSize * 2);
  
  // Select proportionally from each tier based on config
  const selectedItems: TestItem[] = [];
  
  const easyItems = shuffleArray(easyTier).slice(0, config.easyCount);
  const mediumItems = shuffleArray(mediumTier).slice(0, config.mediumCount);
  const hardItems = shuffleArray(hardTier).slice(0, config.hardCount);
  
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
export async function loadTestItems(version: TestVersion = 'beginner'): Promise<Dimension[]> {
  console.log(`[loadTestItems] Loading test items for version: ${version}`);
  
  try {
    let data;
    
    // Try to download from Supabase Storage first
    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('aiq-items')
        .download(`${version}-assessment.json`);
      
      if (downloadError) {
        console.log(`[loadTestItems] Could not download from storage, falling back to public folder:`, downloadError.message);
        throw downloadError;
      }
      
      if (!fileData) {
        throw new Error('No file data returned from storage');
      }
      
      const text = await fileData.text();
      data = JSON.parse(text);
      console.log(`[loadTestItems] Successfully loaded from Supabase Storage`);
    } catch (storageError) {
      // Fallback to public folder
      console.log(`[loadTestItems] Loading from public folder`);
      const response = await fetch(`/test-items/${version}-assessment.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch test items: ${response.statusText}`);
      }
      data = await response.json();
      console.log(`[loadTestItems] Successfully loaded from public folder`);
    }
    
    console.log(`[loadTestItems] Raw data structure:`, {
      hasItemBank: !!data.itemBank,
      itemBankType: Array.isArray(data.itemBank) ? 'array' : typeof data.itemBank,
      hasDimensions: !!data.itemBank?.dimensions,
      dimensionsCount: data.itemBank?.dimensions?.length || data.itemBank?.length || 0
    });
    
    // Get the appropriate version config
    const config = VERSION_CONFIGS[version];
    console.log(`[loadTestItems] Using config:`, config);
    
    // Handle different data structures
    let dimensions: Dimension[];
    
    if (version === 'beginner') {
      // Beginner: wrapped structure with itemBank.dimensions
      if (!data.itemBank?.dimensions) {
        throw new Error('Invalid beginner assessment structure: missing itemBank.dimensions');
      }
      dimensions = data.itemBank.dimensions;
      console.log(`[loadTestItems] Beginner: Using all ${dimensions[0]?.items?.length || 0} items per dimension (fixed, 60 total)`);
    } else {
      // Professional/Expert: direct itemBank array
      if (!Array.isArray(data.itemBank)) {
        throw new Error(`Invalid ${version} assessment structure: itemBank must be an array`);
      }
      dimensions = data.itemBank;
      console.log(`[loadTestItems] ${version}: Selecting ${config.itemsPerDimension} from ${dimensions[0]?.items?.length || 0} items per dimension (adaptive, 80 total)`);
      
      // Apply adaptive selection for professional and expert
      dimensions = dimensions.map(dimension => ({
        ...dimension,
        items: selectItemsForDimension(dimension.items, config)
      }));
    }
    
    console.log(`[loadTestItems] Final dimensions:`, {
      count: dimensions.length,
      itemsPerDimension: dimensions.map(d => d.items.length),
      totalItems: dimensions.reduce((sum, d) => sum + d.items.length, 0)
    });
    
    return dimensions;
  } catch (error) {
    console.error('[loadTestItems] Error loading test items:', error);
    throw error;
  }
}

/**
 * Get display information for a version
 */
export function getVersionInfo(version: TestVersion) {
  const config = VERSION_CONFIGS[version];
  const totalQuestions = config.itemsPerDimension * 8; // 8 dimensions
  const timeInMinutes = config.totalTime;
  
  let description = '';
  let audience = '';
  let adaptive = '';
  
  switch (version) {
    case 'beginner':
      description = 'Foundational AI literacy assessment for newcomers';
      audience = 'Students and beginners to AI';
      adaptive = 'All 60 questions presented (fixed)';
      break;
    case 'professional':
      description = 'Professional-level AI collaboration assessment';
      audience = 'Working professionals';
      adaptive = '10 questions per dimension (adaptive selection from 20)';
      break;
    case 'expert':
      description = 'Expert-level strategic AI assessment';
      audience = 'AI leaders and researchers';
      adaptive = '10 questions per dimension (adaptive selection from 20)';
      break;
  }
  
  return {
    version,
    totalQuestions,
    timeInMinutes,
    description,
    audience,
    adaptive,
    config
  };
}
