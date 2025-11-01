import {
  beginnerRecommendations,
  professionalRecommendations,
  expertRecommendations,
} from "./recommendationsData";

/**
 * Get performance-aware recommendations for a specific dimension
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
  // Determine base recommendations by assessment level
  let baseRecs: string[] = [];
  
  if (assessmentLevel.includes("beginner")) {
    baseRecs = beginnerRecommendations[dimensionCode] || [];
  } else if (assessmentLevel.includes("professional")) {
    baseRecs = professionalRecommendations[dimensionCode] || [];
  } else {
    baseRecs = expertRecommendations[dimensionCode] || [];
  }

  // Adjust recommendations based on actual performance
  // High performers (80%+) get expert-level recommendations
  if (percentage >= 80) {
    const expertRecs = expertRecommendations[dimensionCode];
    if (expertRecs && expertRecs.length > 0) {
      return expertRecs;
    }
  }
  // Low performers (<40%) get foundational recommendations
  else if (percentage < 40) {
    const beginnerRecs = beginnerRecommendations[dimensionCode];
    if (beginnerRecs && beginnerRecs.length > 0) {
      return beginnerRecs;
    }
  }
  // Medium performers (40-60%) on expert assessment might benefit from professional-level guidance
  else if (percentage < 60 && assessmentLevel.includes("expert")) {
    const professionalRecs = professionalRecommendations[dimensionCode];
    if (professionalRecs && professionalRecs.length > 0) {
      return professionalRecs;
    }
  }

  // Default to base recommendations
  return baseRecs.length > 0 ? baseRecs : [
    "Continue practicing AI collaboration skills in this dimension",
    "Seek feedback from peers and mentors on your AI use",
    "Explore advanced resources and training in this area"
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
  if (assessmentLevel.includes("beginner")) {
    if (percentage >= 90) return "Exceptional";
    if (percentage >= 80) return "Advanced";
    if (percentage >= 70) return "Proficient";
    if (percentage >= 60) return "Developing";
    return "Emerging";
  } else if (assessmentLevel.includes("professional")) {
    if (percentage >= 90) return "Expert";
    if (percentage >= 80) return "Advanced";
    if (percentage >= 70) return "Proficient";
    if (percentage >= 60) return "Competent";
    return "Developing";
  } else {
    // Expert level
    if (percentage >= 90) return "Thought Leader";
    if (percentage >= 80) return "Expert";
    if (percentage >= 70) return "Advanced";
    if (percentage >= 60) return "Proficient";
    return "Developing";
  }
}
