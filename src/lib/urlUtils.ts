
/**
 * Detects the AI Studio public (shared) URL even when running in the dev environment.
 * If it's a dev URL (ais-dev-...), it converts it to a pre-preview URL (ais-pre-...).
 * This ensures that shared links don't prompt for AI Studio login.
 */
export const getPublicAppUrl = (): string => {
  const host = window.location.host;
  const protocol = window.location.protocol;
  
  if (host.startsWith('ais-dev-')) {
    const publicHost = host.replace('ais-dev-', 'ais-pre-');
    return `${protocol}//${publicHost}`;
  }
  
  // If it's already pre or a custom domain, return as is (but without query params)
  return `${protocol}//${host}`;
};

/**
 * Generates a deep link for a specific view and optional parameters.
 */
export const generateDeepLink = (view: string, params: Record<string, string> = {}): string => {
  const baseUrl = getPublicAppUrl();
  const url = new URL(baseUrl);
  url.searchParams.set('view', view);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return url.toString();
};
