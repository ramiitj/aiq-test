import { tieredRecommendations } from "./recommendationsData";

/**
 * Get performance-aware, research-aligned recommendations for a specific dimension
 * @param dimensionCode - The dimension code (e.g., "SAU", "QFP")
 * @param percentage - The performance percentage (0-100)
 * @param assessmentLevel - The assessment level (beginner, professional, expert)
 * @returns Array of 3 recommendation strings
 */
export function getRecommendations(
  dimensionCode: string,
  percentage: number,
  assessmentLevel: string
): string[] {
  // Normalize legacy levels to beginner/advanced
  const normalizedLevel = assessmentLevel.toLowerCase() === 'professional' || 
                          assessmentLevel.toLowerCase() === 'expert' 
                          ? 'advanced' 
                          : assessmentLevel.toLowerCase();
  
  // Map normalized level to tier (for recommendations data compatibility)
  let level: "beginner" | "professional" | "expert" = "professional";
  if (normalizedLevel === "beginner") {
    level = "beginner";
  } else if (normalizedLevel === "advanced") {
    level = "expert"; // Map advanced to expert tier for recommendations
  }

  // Determine performance tier based on percentage
  let tier: "low" | "medium" | "high" = "medium";
  if (percentage < 60) {
    tier = "low";
  } else if (percentage >= 80) {
    tier = "high";
  }

  // Get tiered recommendations
  const dimensionRecs = tieredRecommendations[dimensionCode];
  if (dimensionRecs && dimensionRecs[level] && dimensionRecs[level][tier]) {
    return dimensionRecs[level][tier];
  }

  // Fallback recommendations if dimension not found
  return [
    "Continue developing your AI collaboration skills in this dimension",
    "Seek feedback from peers and mentors on your AI use patterns",
    "Explore specialized resources and training in this area of AI collaboration"
  ];
}

/**
 * Determine proficiency level based on percentage score and assessment level
 * @param percentage - The performance percentage (0-100)
 * @param assessmentLevel - The assessment level (beginner, professional, expert)
 * @returns Proficiency level string
 */
export function getProficiencyLevel(
  percentage: number,
  assessmentLevel: string
): string {
  // Normalize legacy levels
  const normalizedLevel = assessmentLevel.toLowerCase() === 'professional' || 
                          assessmentLevel.toLowerCase() === 'expert' 
                          ? 'advanced' 
                          : assessmentLevel.toLowerCase();

  // Beginner assessment thresholds (600 points, 60 items)
  if (normalizedLevel === "beginner") {
    if (percentage >= 91) return "Advanced";
    if (percentage >= 81) return "Proficient";
    if (percentage >= 61) return "Developing";
    if (percentage >= 41) return "Beginner";
    return "Novice";
  }

  // Advanced assessment thresholds (1600 points, 80 items)
  if (normalizedLevel === "advanced") {
    if (percentage >= 96) return "Master";
    if (percentage >= 86) return "Expert";
    if (percentage >= 71) return "Advanced";
    if (percentage >= 51) return "Proficient";
    return "Developing";
  }

  // Default fallback (beginner scale)
  if (percentage >= 91) return "Advanced";
  if (percentage >= 81) return "Proficient";
  if (percentage >= 61) return "Developing";
  if (percentage >= 41) return "Beginner";
  return "Novice";
}
