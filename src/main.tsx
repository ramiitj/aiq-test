import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Build version check for cache busting on deployments
declare const __BUILD_ID__: string;

const checkAndUpdateVersion = () => {
  const storedBuildId = localStorage.getItem('BUILD_ID');
  const currentBuildId = __BUILD_ID__;
  const isReloading = sessionStorage.getItem('isReloading') === 'true';

  // If build ID changed and we're not already in a reload cycle
  if (storedBuildId && storedBuildId !== currentBuildId && !isReloading) {
    console.log('New version detected, updating...');
    
    // Set flag to prevent infinite reload
    sessionStorage.setItem('isReloading', 'true');
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    }
    
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
