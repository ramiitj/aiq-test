import { supabase } from "@/integrations/supabase/client";
import { logError } from "./logger";

export const checkUserRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      logError("Error checking user role:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    logError("Error checking user role:", error);
    return false;
  }
};
