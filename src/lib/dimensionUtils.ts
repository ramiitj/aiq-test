import { professionalRoles } from "@/lib/roleData";
import { generalTrack, adolescent14_15Track, adolescent16_17Track } from "@/lib/trackData";

/**
 * Get dimension name from code based on product slug
 * Dynamically resolves dimension names for all assessment types
 * Supports both beginner and advanced dimensions for professional roles
 */
export function getDimensionName(code: string, productSlug: string | null | undefined): string {
  if (!productSlug) {
    // Try general track first
    const generalDim = generalTrack.dimensions.find(d => d.code === code);
    if (generalDim) return generalDim.name;
    return code;
  }

  // Check adolescent tracks
  if (productSlug.includes('adolescent-14-15')) {
    const dim = adolescent14_15Track.dimensions.find(d => d.code === code);
    if (dim) return dim.name;
  }
  
  if (productSlug.includes('adolescent-16-17')) {
    const dim = adolescent16_17Track.dimensions.find(d => d.code === code);
    if (dim) return dim.name;
  }

  // Check general tracks
  if (productSlug.includes('general')) {
    const dim = generalTrack.dimensions.find(d => d.code === code);
    if (dim) return dim.name;
  }

  // Check professional roles - with advanced dimensions support
  for (const role of professionalRoles) {
    const isBeginner = productSlug === role.beginnerSlug;
    const isAdvanced = productSlug === role.advancedSlug;
    
    if (isBeginner || isAdvanced) {
      // For advanced assessments, check advancedDimensions first if available
      if (isAdvanced && role.advancedDimensions) {
        const advDim = role.advancedDimensions.find(d => d.code === code);
        if (advDim) return advDim.name;
      }
      
      // Check regular dimensions (also as fallback for advanced)
      const dim = role.dimensions.find(d => d.code === code);
      if (dim) return dim.name;
    }
    
    // Also try matching by role slug prefix
    const rolePrefix = role.beginnerSlug.replace('-beginner', '');
    if (productSlug.startsWith(rolePrefix)) {
      // Determine if advanced based on slug
      const isAdvancedPrefix = productSlug.includes('-advanced');
      
      if (isAdvancedPrefix && role.advancedDimensions) {
        const advDim = role.advancedDimensions.find(d => d.code === code);
        if (advDim) return advDim.name;
      }
      
      const dim = role.dimensions.find(d => d.code === code);
      if (dim) return dim.name;
    }
  }

  // Fallback: try all tracks and roles to find any match
  const generalDim = generalTrack.dimensions.find(d => d.code === code);
  if (generalDim) return generalDim.name;

  for (const role of professionalRoles) {
    // Check advanced dimensions first
    if (role.advancedDimensions) {
      const advDim = role.advancedDimensions.find(d => d.code === code);
      if (advDim) return advDim.name;
    }
    // Then check regular dimensions
    const dim = role.dimensions.find(d => d.code === code);
    if (dim) return dim.name;
  }

  // Return code as fallback
  return code;
}

/**
 * Get all dimension data for a product slug
 * Returns array of {code, name, description} for the assessment type
 * Supports both beginner and advanced dimensions for professional roles
 */
export function getDimensionsForProduct(productSlug: string | null | undefined): { code: string; name: string; description: string }[] {
  if (!productSlug) {
    return generalTrack.dimensions;
  }

  // Check adolescent tracks
  if (productSlug.includes('adolescent-14-15')) {
    return adolescent14_15Track.dimensions;
  }
  
  if (productSlug.includes('adolescent-16-17')) {
    return adolescent16_17Track.dimensions;
  }

  // Check general tracks
  if (productSlug.includes('general')) {
    return generalTrack.dimensions;
  }

  // Check professional roles - with advanced dimensions support
  for (const role of professionalRoles) {
    const isBeginner = productSlug === role.beginnerSlug;
    const isAdvanced = productSlug === role.advancedSlug;
    
    if (isBeginner) {
      return role.dimensions;
    }
    
    if (isAdvanced) {
      // Use advancedDimensions if available, otherwise fall back to regular dimensions
      return role.advancedDimensions || role.dimensions;
    }
    
    // Also try matching by role slug prefix
    const rolePrefix = role.beginnerSlug.replace('-beginner', '');
    if (productSlug.startsWith(rolePrefix)) {
      const isAdvancedPrefix = productSlug.includes('-advanced');
      if (isAdvancedPrefix && role.advancedDimensions) {
        return role.advancedDimensions;
      }
      return role.dimensions;
    }
  }

  // Fallback to general track
  return generalTrack.dimensions;
}
