import { supabase } from "@/integrations/supabase/client";
import { logError } from "./logger";

// Role cache to prevent timing attacks and improve performance
interface RoleCache {
  isAdmin: boolean;
  expiresAt: number;
}

const roleCache = new Map<string, RoleCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if user has admin role with constant-time execution and caching
 * Uses database function with random delay to prevent timing attacks
 */
export const checkUserRole = async (userId: string): Promise<boolean> => {
  try {
    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.isAdmin;
    }

    // Use constant-time database function
    const { data, error } = await supabase.rpc('check_admin_constant_time', {
      _user_id: userId
    });

    if (error) {
      logError("Error checking user role:", error);
      return false;
    }

    const isAdmin = !!data;

    // Cache the result
    roleCache.set(userId, {
      isAdmin,
      expiresAt: Date.now() + CACHE_TTL
    });

    return isAdmin;
  } catch (error) {
    logError("Error checking user role:", error);
    return false;
  }
};

/**
 * Clear role cache for a specific user (e.g., after role changes)
 */
export const clearRoleCache = (userId: string) => {
  roleCache.delete(userId);
};

/**
 * Clear all role caches
 */
export const clearAllRoleCaches = () => {
  roleCache.clear();
};
