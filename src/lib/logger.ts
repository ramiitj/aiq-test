/**
 * Safe logging utility that prevents sensitive data exposure in production
 * Only logs to console in development mode
 */
export const logError = (message: string, error?: unknown) => {
  // Only log detailed errors in development
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
  
  // In production, errors should be sent to an error tracking service
  // (e.g., Sentry, LogRocket) with sanitized data - not implemented yet
};

export const logInfo = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};

export const logWarn = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.warn(message, data);
  }
};
