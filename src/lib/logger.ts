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

export const logSecurityViolation = async (testId: string, violationType: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-security-violation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession())).data.session?.access_token}`,
      },
      body: JSON.stringify({
        testId,
        violationType,
        userAgent: navigator.userAgent,
        additionalData: {
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to log security violation');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    logError('Failed to log security violation', error);
    return null;
  }
};
