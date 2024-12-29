import { HYPERBOLIC_API_KEY } from "./config";

const HYPERBOLIC_API_URL = 'https://api.hyperbolic.xyz/v1/audio/generation';

export async function generateAudio(text: string, speed: number = 1): Promise<string> {
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

    if (!data.images) {
      console.error('Unexpected API response structure:', data);
      throw new Error('API response missing images array');
    }

    if (!data.images[0]) {
      console.error('No audio URL in images array:', data.images);
      throw new Error('No audio URL found in API response');
    }

    const audioUrl = data.images[0];
    console.log('Successfully extracted audio URL:', audioUrl);

    return audioUrl;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw error instanceof Error ? error : new Error('Failed to generate audio');
  }
}