export interface AssessmentContext {
  type: 'adolescent' | 'role-specific' | 'general';
  isAdolescent: boolean;
  assessmentName: string;
  ageGroup?: string;
  role?: string;
  track: string;
  displayTitle: string;
}

export function getAssessmentContext(
  productName?: string,
  productSlug?: string,
  ageGroup?: string,
  track?: string,
  role?: string
): AssessmentContext {
  // Detect adolescent assessments
  const isAdolescent = !!(
    ageGroup || 
    productSlug?.includes('adolescent') || 
    productName?.toLowerCase().includes('student') ||
    productName?.toLowerCase().includes('ages')
  );
  
  if (isAdolescent) {
    return {
      type: 'adolescent',
      isAdolescent: true,
      assessmentName: productName || 'AIQ Student Assessment',
      ageGroup,
      track: track || 'adolescent',
      displayTitle: `${productName || 'AIQ Student Assessment'}`
    };
  }
  
  // Detect role-specific assessments
  const isRoleSpecific = !!(
    role || 
    (productSlug && !productSlug.includes('general') && productSlug.split('-')[0] && 
     !['beginner', 'advanced', 'expert'].includes(productSlug.split('-')[0]))
  );
  
  if (isRoleSpecific) {
    const roleName = role || productSlug?.split('-')[0]?.toUpperCase();
    return {
      type: 'role-specific',
      isAdolescent: false,
      assessmentName: productName || 'AIQ Professional Assessment',
      role: roleName,
      track: track || 'role-based',
      displayTitle: `${productName || `${roleName} Professional Assessment`}`
    };
  }
  
  // Default to general assessment
  return {
    type: 'general',
    isAdolescent: false,
    assessmentName: productName || 'AIQ General Assessment',
    track: track || 'general',
    displayTitle: productName || 'AIQ General Assessment'
  };
}

export function getPerformanceDescriptor(
  percentage: number,
  assessmentContext: AssessmentContext
): string {
  // Adolescent-specific descriptors (encouraging, age-appropriate)
  if (assessmentContext.isAdolescent) {
    if (percentage >= 91) return "Outstanding";
    if (percentage >= 81) return "Excellent";
    if (percentage >= 61) return "Good Progress";
    if (percentage >= 41) return "Making Progress";
    return "Keep Learning";
  }
  
  // Professional/Advanced descriptors (default)
  if (percentage >= 91) return "Advanced";
  if (percentage >= 81) return "Proficient";
  if (percentage >= 61) return "Developing";
  if (percentage >= 41) return "Beginner";
  return "Novice";
}
