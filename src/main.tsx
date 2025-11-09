import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Build version check for cache busting
declare const __BUILD_ID__: string;

const storedBuildId = localStorage.getItem('BUILD_ID');
const currentBuildId = __BUILD_ID__;

if (storedBuildId !== currentBuildId) {
  console.log('New version detected, clearing cache...');
  
  // Unregister service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  
  // Clear cache storage
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
  
  // Update stored build ID
  localStorage.setItem('BUILD_ID', currentBuildId);
  
  // Force hard reload without changing the URL
  window.location.reload();
}

createRoot(document.getElementById("root")!).render(<App />);
