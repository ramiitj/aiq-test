import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Build version check for cache busting on deployments
declare const __BUILD_ID__: string;

// Clear all caches except Supabase auth session
const clearAppCaches = () => {
  // Always clear service worker caches on every page load
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
  
  // Clear localStorage except Supabase auth keys (sb-*)
  const authKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sb-')) {
      authKeys.push(key);
    }
  }
  
  // Preserve auth data
  const authData: Record<string, string> = {};
  authKeys.forEach(key => {
    authData[key] = localStorage.getItem(key) || '';
  });
  
  // Clear all localStorage
  localStorage.clear();
  
  // Restore auth data
  Object.entries(authData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  // Clear sessionStorage (except during reload cycle)
  const isReloading = sessionStorage.getItem('isReloading') === 'true';
  if (!isReloading) {
    sessionStorage.clear();
  }
};

const checkAndUpdateVersion = () => {
  const storedBuildId = localStorage.getItem('BUILD_ID');
  const currentBuildId = __BUILD_ID__;
  const isReloading = sessionStorage.getItem('isReloading') === 'true';

  // Always clear caches on every page load
  clearAppCaches();

  // If build ID changed and we're not already in a reload cycle
  if (storedBuildId && storedBuildId !== currentBuildId && !isReloading) {
    console.log('New version detected, updating...');
    
    // Set flag to prevent infinite reload
    sessionStorage.setItem('isReloading', 'true');
    
    // Update stored build ID
    localStorage.setItem('BUILD_ID', currentBuildId);
    
    // Reload to get new version
    window.location.reload();
    return;
  }
  
  // Clear reload flag and store build ID on successful load
  sessionStorage.removeItem('isReloading');
  localStorage.setItem('BUILD_ID', currentBuildId);
};

checkAndUpdateVersion();

createRoot(document.getElementById("root")!).render(<App />);
