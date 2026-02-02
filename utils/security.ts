/**
 * Almarky Security Vault
 * SENSITIVE CREDENTIALS MANAGED VIA ENVIRONMENT VARIABLES.
 * Deployment Note: Set these in your Vercel/GitHub Settings -> Environment Variables.
 */

// GitHub Data Engine (Inventory Sync)
export const getSecureToken = (): string => (process.env.GITHUB_TOKEN || "").trim();
export const getSecureRepo = (): string => (process.env.GITHUB_REPO || "").trim();

// Cloudinary Media Hub (Image Hosting)
export const getCloudinaryDefaults = () => ({
  cloudName: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
  apiKey: (process.env.CLOUDINARY_API_KEY || "").trim(),
  uploadPreset: (process.env.CLOUDINARY_UPLOAD_PRESET || "").trim()
});

// Google Sheets Automation (Order Logging)
export const getGoogleScriptUrl = (): string => (process.env.GOOGLE_SCRIPT_URL || "").trim();

// Gemini AI Key
export const getGeminiKey = (): string => (process.env.API_KEY || "").trim();

// Firebase Specific Key (Falling back to API_KEY if not specified)
export const getFirebaseKey = (): string => (process.env.FIREBASE_API_KEY || process.env.API_KEY || "").trim();

// Admin Dashboard Gatekeeper
export const getAdminMasterPassword = (): string => process.env.ADMIN_PASSWORD || "Subhan6565@almarky";

/**
 * Validates if the application is correctly configured for live operations.
 */
export const isCloudSyncReady = (): boolean => {
  const token = getSecureToken();
  const repo = getSecureRepo();
  const cld = getCloudinaryDefaults();
  const script = getGoogleScriptUrl();
  const api = getGeminiKey();
  const fbKey = process.env.FIREBASE_API_KEY;
  const fbProj = process.env.FIREBASE_PROJECT_ID;
  
  const ready = !!(token && repo && cld.cloudName && script && api && fbKey && fbProj);
  
  if (!ready && process.env.NODE_ENV !== 'production') {
    console.error("ALMARKY SECURITY ALERT: Missing Critical Env Variables. Check your FIREBASE_, GITHUB_, and API_KEY settings.");
  }
  
  return ready;
};
