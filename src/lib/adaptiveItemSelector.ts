/**
 * Adaptive Item Selection for All Assessment Products
 * Handles variable question counts, durations, and formats
 * using the unified assessment adapter
 */

import { supabase } from "@/integrations/supabase/client";
import { loadNormalizedAssessment, type NormalizedAssessment } from "./assessmentAdapter";

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

export interface ScoringConfiguration {
  totalPoints: number;
  pointsPerDimension: number;
  passingScore: number;
  passingPercentage: number;
  scoringMethod: {
    type: string;
    description: string;
    basePoints: number;
    formula: string;
  };
  scoringGuidelines: {
    [key: string]: string;
  };
}

export interface AssessmentData {
  dimensions: Dimension[];
  scoringConfiguration: ScoringConfiguration;
  assessmentInfo: {
    name: string;
    description: string;
    tier: string;
    totalTime: number;
    questionCount: number;
  };
}

export type TestVersion = 'beginner' | 'advanced';

export interface DifficultyConfig {
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

/**
 * Calculate difficulty distribution based on question count
 * For adaptive assessments (question count differs from available items)
 */
function calculateDifficultyDistribution(targetCount: number, availableCount: number): DifficultyConfig {
  // If target matches available, use all items (fixed assessment)
  if (targetCount === availableCount) {
    return {
      easyCount: Math.ceil(targetCount * 0.4),
      mediumCount: Math.ceil(targetCount * 0.4),
      hardCount: Math.ceil(targetCount * 0.2)
    };
  }
  
  // Adaptive selection with balanced distribution
  const ratio = targetCount / availableCount;
  
  if (ratio < 0.4) {
    // Selecting less than 40% - focus on harder items
    return {
      easyCount: Math.ceil(targetCount * 0.2),
      mediumCount: Math.ceil(targetCount * 0.3),
      hardCount: Math.ceil(targetCount * 0.5)
    };
  } else if (ratio < 0.7) {
    // Selecting 40-70% - balanced distribution
    return {
      easyCount: Math.ceil(targetCount * 0.3),
      mediumCount: Math.ceil(targetCount * 0.4),
      hardCount: Math.ceil(targetCount * 0.3)
    };
  } else {
    // Selecting most items - easier distribution
    return {
      easyCount: Math.ceil(targetCount * 0.4),
      mediumCount: Math.ceil(targetCount * 0.4),
      hardCount: Math.ceil(targetCount * 0.2)
    };
  }
}

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
 * Uses difficulty-based tiering with dynamic distribution
 */
export function selectItemsForDimension(
  items: TestItem[],
  targetCount: number,
  difficultyConfig: DifficultyConfig,
  selectedItemIds: Set<string>
): TestItem[] {
  if (items.length === 0) return [];

  // Helper: normalize a question text for duplicate detection
  const normalize = (s: string | undefined) =>
    (s || "").replace(/\s+/g, " ").trim().toLowerCase();

  // Helper: build a unique list by question text first (content), then by ID
  const uniqueBy = <T>(arr: T[], key: (t: T) => string) => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const el of arr) {
      const k = key(el);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(el);
      }
    }
    return out;
  };

  // 1) Remove items already chosen anywhere in the test (across dimensions)
  // 2) De-duplicate by question text to avoid visually repeated questions with different IDs
  // 3) De-duplicate by ID just in case the source has literal duplicates
  const availableItems = items
    .filter((item) => !selectedItemIds.has(item.id))
    .filter((item) => !!item.question && item.question.trim().length > 0);

  const byQuestion = uniqueBy(availableItems, (i) => normalize(i.question));
  const deduped = uniqueBy(byQuestion, (i) => (i.id || "").toString());

  if (deduped.length === 0) return [];

  // Sort by difficulty to divide into tiers
  const sortedItems = [...deduped].sort((a, b) => a.difficulty - b.difficulty);

  const totalItems = sortedItems.length;

  // Divide into three difficulty tiers using two breakpoints for better distribution
  const break1 = Math.floor(totalItems / 3);
  const break2 = Math.floor((totalItems * 2) / 3);
  const easyTier = sortedItems.slice(0, break1);
  const mediumTier = sortedItems.slice(break1, break2);
  const hardTier = sortedItems.slice(break2);

  // Local set to guarantee uniqueness within this dimension as we pick
  const pickedKeys = new Set<string>(); // using question text key to avoid duplicates with different IDs
  const getKey = (i: TestItem) => normalize(i.question) || i.id;

  const pickUnique = (pool: TestItem[], count: number): TestItem[] => {
    const out: TestItem[] = [];
    for (const item of shuffleArray(pool)) {
      const key = getKey(item);
      if (!pickedKeys.has(key)) {
        pickedKeys.add(key);
        out.push(item);
        if (out.length >= count) break;
      }
    }
    return out;
  };

  const selectedItems: TestItem[] = [];
  selectedItems.push(
    ...pickUnique(easyTier, difficultyConfig.easyCount),
    ...pickUnique(mediumTier, difficultyConfig.mediumCount),
    ...pickUnique(hardTier, difficultyConfig.hardCount)
  );

  // If we couldn't fulfill counts due to limited tier items, top-up from the remaining pool
  const needed = Math.max(0, targetCount - selectedItems.length);
  if (needed > 0) {
    const remainingPool = sortedItems.filter((i) => !pickedKeys.has(getKey(i)));
    selectedItems.push(...pickUnique(remainingPool, needed));
  }

  // Track globally selected IDs to avoid cross-dimension duplicates
  selectedItems.forEach((item) => selectedItemIds.add(item.id));

  // Sort selected items by difficulty for progressive difficulty
  return selectedItems.sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * Load and prepare assessment securely using edge function
 * Supports all 19 assessment products with variable formats
 */
export async function loadTestItems(
  slugOrVersion: string = 'general-beginner',
  testId: string,
  supabaseClient: any,
  legacyFallback: boolean = true
): Promise<AssessmentData> {
  console.log(`[loadTestItems] Loading assessment: ${slugOrVersion}`);
  
  try {
    // Map legacy version names to new slugs for backward compatibility
    let productSlug = slugOrVersion;
    if (legacyFallback) {
      // ONLY map if it's exactly 'beginner', 'advanced', etc without dashes
      // This preserves slugs like 'adolescent-14-15', 'pm-beginner', etc
      if (slugOrVersion === 'beginner' && !slugOrVersion.includes('-')) {
        productSlug = 'general-beginner';
      } else if ((slugOrVersion === 'advanced' || slugOrVersion === 'professional' || slugOrVersion === 'expert') && !slugOrVersion.includes('-')) {
        productSlug = 'general-advanced';
      }
      // Otherwise, use slugOrVersion as-is (e.g., 'adolescent-14-15', 'pm-beginner')
    }
    
    console.log(`[loadTestItems] Loading via edge function for test: ${testId}`);
    
    // Use the assessment adapter to load securely from edge function
    const normalized = await loadNormalizedAssessment(productSlug, testId, supabaseClient);
    
    console.log(`[loadTestItems] Normalized assessment:`, {
      name: normalized.name,
      tier: normalized.assessmentTier,
      type: normalized.assessmentType,
      questionCount: normalized.questionCount,
      availableItems: normalized.totalAvailableItems,
      dimensionsCount: normalized.dimensions.length,
      totalTime: normalized.totalTime
    });
    
    // Convert normalized dimensions to internal format
    let dimensions: Dimension[] = normalized.dimensions.map(dim => ({
      dimensionCode: dim.code,
      dimensionName: dim.name,
      description: dim.description,
      weight: 1 / normalized.dimensions.length, // Equal weight by default
      totalPoints: normalized.scoring?.totalPoints 
        ? Math.floor(normalized.scoring.totalPoints / normalized.dimensions.length)
        : 100,
      items: dim.items.map(item => ({
        id: item.id,
        type: (item.type as any) || 'multiple-choice',
        question: item.text,
        options: item.options,
        correctAnswer: typeof item.correctAnswer === 'number' || typeof item.correctAnswer === 'boolean'
          ? item.correctAnswer 
          : (Array.isArray(item.correctAnswer) ? 0 : 0),
        correctAnswers: item.correctAnswers, // Preserve for multiple-response
        explanation: item.explanation,
        rationale: item.explanation,
        points: 10,
        difficulty: parseFloat(item.difficulty as any) || 0.5,
        tags: []
      }))
    }));
    
    // Determine if adaptive IRT-based selection is needed
    const totalAvailableItems = dimensions.reduce((sum, d) => sum + d.items.length, 0);
    const isAdaptive = normalized.assessmentType === 'adaptive';
    const needsSelection = totalAvailableItems > normalized.questionCount;
    
    console.log(`[loadTestItems] Adaptive check:`, {
      assessmentType: normalized.assessmentType,
      isAdaptive,
      totalAvailableItems,
      targetQuestionCount: normalized.questionCount,
      needsSelection,
      dimensionsCount: dimensions.length
    });
    
    if (isAdaptive && needsSelection && dimensions.length > 0) {
      console.log(`[loadTestItems] ✅ Running IRT-based adaptive selection: ${normalized.questionCount} from ${totalAvailableItems} items`);
      
      const itemsPerDimension = Math.floor(normalized.questionCount / dimensions.length);
      const selectedItemIds = new Set<string>();
      
      dimensions = dimensions.map((dimension, idx) => {
        const availableCount = dimension.items.length;
        const targetCount = itemsPerDimension + (idx < (normalized.questionCount % dimensions.length) ? 1 : 0);
        
        // Calculate difficulty distribution for this dimension
        const difficultyConfig = calculateDifficultyDistribution(targetCount, availableCount);
        
        return {
          ...dimension,
          items: selectItemsForDimension(dimension.items, targetCount, difficultyConfig, selectedItemIds)
        };
      });
      
      // Validate no duplicates
      const allItemIds = dimensions.flatMap(d => d.items.map(i => i.id));
      const uniqueItemIds = new Set(allItemIds);
      if (allItemIds.length !== uniqueItemIds.size) {
        console.error('Duplicate items detected in assessment');
        throw new Error('Assessment generation failed: duplicate items found');
      }
      
      const selectedTotal = dimensions.reduce((sum, d) => sum + d.items.length, 0);
      console.log(`[loadTestItems] ✅ Adaptive selection complete: ${selectedTotal} items selected (target: ${normalized.questionCount})`);
    } else {
      console.log(`[loadTestItems] ℹ️ Using all available items (no adaptive selection):`, {
        reason: !isAdaptive ? 'assessment type is not adaptive' : !needsSelection ? 'selection not needed' : 'no dimensions found',
        assessmentType: normalized.assessmentType,
        totalItems: totalAvailableItems,
        targetCount: normalized.questionCount
      });
    }
    
    const finalTotalItems = dimensions.reduce((sum, d) => sum + d.items.length, 0);
    console.log(`[loadTestItems] Final assessment:`, {
      dimensionsCount: dimensions.length,
      itemsPerDimension: dimensions.map(d => d.items.length),
      totalItems: finalTotalItems
    });
    
    // Build scoring configuration from normalized data
    const scoringConfiguration: ScoringConfiguration = {
      totalPoints: normalized.scoring?.totalPoints || finalTotalItems * 10,
      pointsPerDimension: normalized.scoring?.totalPoints 
        ? Math.floor(normalized.scoring.totalPoints / dimensions.length)
        : Math.floor((finalTotalItems * 10) / dimensions.length),
      passingScore: normalized.scoring?.passingScore || Math.floor(finalTotalItems * 10 * 0.7),
      passingPercentage: 70,
      scoringMethod: {
        type: 'simple-sum',
        description: 'Points-based scoring with difficulty weighting',
        basePoints: 10,
        formula: 'points = basePoints × (1 + difficulty × 0.3)'
      },
      scoringGuidelines: {
        '0-40%': 'Novice',
        '41-60%': 'Beginner',
        '61-80%': 'Developing',
        '81-90%': 'Proficient',
        '91-100%': 'Advanced'
      }
    };
    
    return {
      dimensions,
      scoringConfiguration,
      assessmentInfo: {
        name: normalized.name,
        description: normalized.description,
        tier: normalized.assessmentTier,
        totalTime: normalized.totalTime,
        questionCount: finalTotalItems
      }
    };
  } catch (error) {
    console.error('[loadTestItems] Error loading test items:', error);
    throw error;
  }
}

/**
 * Get display information for a product slug
 */
export function getAssessmentInfo(slugOrVersion: string) {
  // Map legacy versions for backward compatibility
  if (slugOrVersion === 'beginner') slugOrVersion = 'general-beginner';
  if (slugOrVersion === 'advanced' || slugOrVersion === 'professional' || slugOrVersion === 'expert') {
    slugOrVersion = 'general-advanced';
  }
  
  return {
    slug: slugOrVersion,
    filePath: `/test-items/${slugOrVersion}.json`
  };
}
