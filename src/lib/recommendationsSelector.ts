import { tieredRecommendations } from "./recommendationsData";

import type { AssessmentContext } from "./assessmentUtils";

/**
 * Get performance-aware, research-aligned recommendations for a specific dimension
 * @param dimensionCode - The dimension code (e.g., "SAU", "QFP")
 * @param percentage - The performance percentage (0-100)
 * @param assessmentLevel - The assessment level (beginner, professional, expert)
 * @param assessmentContext - Optional assessment context for role-specific recommendations
 * @returns Array of 3 recommendation strings
 */
export function getRecommendations(
  dimensionCode: string,
  percentage: number,
  assessmentLevel: string,
  assessmentContext?: AssessmentContext
): string[] {
  let level: "beginner" | "professional" | "expert" | "adolescent" | string = "professional";
  
  // Check for adolescent first
  if (assessmentContext?.isAdolescent) {
    level = "adolescent";
  }
  // Check for role-specific
  else if (assessmentContext?.type === 'role-specific' && assessmentContext.role) {
    // Map role names to slug prefixes
    const roleToSlugMap: Record<string, string> = {
      'Accounting & Finance': 'ac',
      'Business Analyst': 'ba',
      'Software Engineer': 'sde',
      'Product Manager': 'pm',
      'Digital Marketer': 'dm',
      'Data Scientist': 'ds',
      'HR Professional': 'hr',
      'Operations Manager': 'ops',
      'Sales Professional': 'sales',
      'Doctors': 'doc',
      'Financial Advisors': 'fa',
      'Healthcare Administrators': 'ha',
      'Lawyers': 'lawyer',
      'Management Consultants': 'mc'
    };
    
    const roleSlugPrefix = roleToSlugMap[assessmentContext.role] || assessmentContext.role.toLowerCase().replace(/\s+/g, '-');
    const proficiencyLevel = assessmentLevel.toLowerCase().includes('advanced') ? 'advanced' : 'beginner';
    const roleSpecificKey = `${roleSlugPrefix}-${proficiencyLevel}`;
    
    // Check if role-specific recommendations exist
    const dimensionRecs = tieredRecommendations[dimensionCode];
    if (dimensionRecs && dimensionRecs[roleSpecificKey]) {
      level = roleSpecificKey;
    } else {
      // Fallback to generic level
      level = proficiencyLevel === 'beginner' ? 'beginner' : 'expert';
    }
  }
  // Generic levels
  else {
    const normalizedLevel = assessmentLevel.toLowerCase() === 'professional' || 
                            assessmentLevel.toLowerCase() === 'expert' 
                            ? 'advanced' 
                            : assessmentLevel.toLowerCase();
    
    if (normalizedLevel === "beginner") {
      level = "beginner";
    } else if (normalizedLevel === "advanced") {
      level = "expert";
    }
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
  assessmentLevel: string,
  scoringGuidelines?: Record<string, string>
): string {
  // Use scoring guidelines from the assessment JSON if available
  if (scoringGuidelines) {
    const ranges = Object.entries(scoringGuidelines).sort((a, b) => {
      const aMin = parseInt(a[0].split('-')[0]);
      const bMin = parseInt(b[0].split('-')[0]);
      return bMin - aMin; // Sort descending
    });
    
    for (const [range, level] of ranges) {
      const [min, max] = range.split('-').map(s => parseInt(s.replace('%', '')));
      if (percentage >= min && percentage <= max) {
        // Extract just the level name (e.g., "Master" from "Master (1521-1600 points)")
        return level.split('(')[0].trim();
      }
    }
  }

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
