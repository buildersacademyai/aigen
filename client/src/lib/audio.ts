import { HYPERBOLIC_API_KEY } from "./config";

const HYPERBOLIC_API_URL = 'https://api.hyperbolic.xyz/v1/audio/generation';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function generateAudio(text: string, speed: number = 1): Promise<string> {
  let retries = 0;

  async function attemptGeneration(): Promise<string> {
    try {
      // Trim and format text to avoid any potential issues
      const formattedText = text.trim().slice(0, 5000); // Limit text length
      console.log('Generating audio for text:', formattedText.substring(0, 100) + '...');

      // Verify API key is available
      if (!HYPERBOLIC_API_KEY) {
        throw new Error('HYPERBOLIC_API_KEY is not configured');
      }

      console.log('Making request to Hyperbolic API...');
      const response = await fetch(HYPERBOLIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`,
        },
        body: JSON.stringify({
          text: formattedText,
          speed
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Audio generation API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw API Response:', data);

      // Verify the response structure
      if (!data.audio && !data.images) {
        console.error('Unexpected API response structure:', data);
        throw new Error('API response missing both audio and images fields');
      }

      // Try both potential response formats
      const audioUrl = data.audio || (data.images && data.images[0]);
      if (!audioUrl) {
        console.error('No audio URL in response:', data);
        throw new Error('No audio URL in API response');
      }

      // Basic URL validation
      if (!audioUrl.startsWith('http') && !audioUrl.startsWith('data:') && !audioUrl.startsWith('//')) {
        console.error('Invalid audio URL format:', audioUrl);
        throw new Error('Invalid audio URL format');
      }

      console.log('Successfully extracted audio URL:', audioUrl);
      return audioUrl;

    } catch (error) {
      console.error('Error generating audio:', error);

      if (retries < MAX_RETRIES) {
        retries++;
        console.log(`Retrying audio generation (attempt ${retries} of ${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return attemptGeneration();
      }

      throw error instanceof Error ? error : new Error('Failed to generate audio');
    }
  }

  return attemptGeneration();
}