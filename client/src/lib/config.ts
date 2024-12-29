// Configuration file for API keys and settings
export const HYPERBOLIC_API_KEY = import.meta.env.HYPERBOLIC_API_KEY || '';

if (!HYPERBOLIC_API_KEY) {
  console.warn('HYPERBOLIC_API_KEY is not set. Audio generation will not work.');
}
