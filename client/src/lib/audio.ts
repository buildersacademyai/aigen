import { HYPERBOLIC_API_KEY } from "./config";

const HYPERBOLIC_API_URL = 'https://api.hyperbolic.xyz/v1/audio/generation';

export async function generateAudio(text: string, speed: number = 1): Promise<string> {
  try {
    // Verify API key is available
    if (!HYPERBOLIC_API_KEY) {
      throw new Error('HYPERBOLIC_API_KEY is not configured');
    }

    console.log('Making request to Hyperbolic API with text:', text.substring(0, 100) + '...');

    const response = await fetch(HYPERBOLIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`,
      },
      body: JSON.stringify({
        text: text,
        speed: speed
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    // The API returns the audio URL directly in the response
    const audioUrl = data.audio_url || data.audioUrl;
    if (!audioUrl) {
      throw new Error('No audio URL in API response');
    }

    console.log('Generated audio URL:', audioUrl);
    return audioUrl;

  } catch (error) {
    console.error('Error generating audio:', error);
    throw error instanceof Error ? error : new Error('Failed to generate audio');
  }
}