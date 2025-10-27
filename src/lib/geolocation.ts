import { supabase } from "@/integrations/supabase/client";

interface GeolocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Captures user's geolocation using browser's Geolocation API
 * and reverse geocoding to get location details
 */
export const captureUserLocation = async (userId: string): Promise<boolean> => {
  try {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser");
      return false;
    }

    // Get coordinates
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 60000,
      });
    });

    const { latitude, longitude } = position.coords;

    // Use reverse geocoding to get location details
    const locationData = await reverseGeocode(latitude, longitude);

    // Update user profile with location
    const { error } = await supabase
      .from("profiles")
      .update({
        region: locationData.region || "Unknown",
        country: locationData.country,
        city: locationData.city,
        latitude,
        longitude,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating profile with location:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error capturing location:", error);
    return false;
  }
};

/**
 * Reverse geocode coordinates to get location details using OpenStreetMap Nominatim API
 */
const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeolocationData> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      {
        headers: {
          "User-Agent": "AIQ-Assessment-App",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      country: address.country || "Unknown",
      region: address.state || address.region || "Unknown",
      city: address.city || address.town || address.village || "Unknown",
      latitude,
      longitude,
    };
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return {
      region: "Unknown",
      latitude,
      longitude,
    };
  }
};

/**
 * Request user permission for location access
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state === "granted" || result.state === "prompt";
  } catch (error) {
    // Permissions API not supported, try direct access
    return true;
  }
};
