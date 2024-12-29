// Configuration file for API keys and settings
export const HYPERBOLIC_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0YnVnMzQ3OEBnbWFpbC5jb20iLCJpYXQiOjE3MzU0ODUyMTN9.kAjkSvkjGrKBdw9RfQVGNi5l70W-LxBx7X0OKAHX_ek';

if (!HYPERBOLIC_API_KEY) {
  console.error('HYPERBOLIC_API_KEY is not configured');
  throw new Error('HYPERBOLIC_API_KEY is required for audio generation');
}