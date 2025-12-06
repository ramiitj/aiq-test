import { professionalRoles } from "@/lib/roleData";
import { generalTrack, adolescent14_15Track, adolescent16_17Track } from "@/lib/trackData";

/**
 * Get dimension name from code based on product slug
 * Dynamically resolves dimension names for all assessment types
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

  // Check professional roles
  for (const role of professionalRoles) {
    // Match by beginnerSlug or advancedSlug
    if (productSlug === role.beginnerSlug || productSlug === role.advancedSlug) {
      const dim = role.dimensions.find(d => d.code === code);
      if (dim) return dim.name;
    }
    
    // Also try matching by role slug prefix
    const rolePrefix = role.beginnerSlug.replace('-beginner', '');
    if (productSlug.startsWith(rolePrefix)) {
      const dim = role.dimensions.find(d => d.code === code);
      if (dim) return dim.name;
    }
  }

  // Fallback: try all tracks and roles to find any match
  const generalDim = generalTrack.dimensions.find(d => d.code === code);
  if (generalDim) return generalDim.name;

  for (const role of professionalRoles) {
    const dim = role.dimensions.find(d => d.code === code);
    if (dim) return dim.name;
  }

  // Return code as fallback
  return code;
}

/**
 * Get all dimension data for a product slug
 * Returns array of {code, name, description} for the assessment type
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

  // Check professional roles
  for (const role of professionalRoles) {
    if (productSlug === role.beginnerSlug || productSlug === role.advancedSlug) {
      return role.dimensions;
    }
    
    const rolePrefix = role.beginnerSlug.replace('-beginner', '');
    if (productSlug.startsWith(rolePrefix)) {
      return role.dimensions;
    }
  }

  // Fallback to general track
  return generalTrack.dimensions;
}
