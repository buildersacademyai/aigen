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
    console.log('Audio generation response:', data);

    if (!data.images || !data.images[0]) {
      throw new Error('No audio URL in API response');
    }

    return data.images[0];
  } catch (error) {
    console.error('Error generating audio:', error);
    throw error instanceof Error ? error : new Error('Failed to generate audio');
  }
}