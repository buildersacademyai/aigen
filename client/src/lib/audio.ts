import { HYPERBOLIC_API_KEY } from "./config";

const HYPERBOLIC_API_URL = 'https://api.hyperbolic.xyz/v1/audio/generation';

export async function generateAudio(text: string, speed: number = 1): Promise<string> {
  try {
    console.log('Starting audio generation with text:', text.substring(0, 100) + '...');

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
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Full API Response:', data);

    // Extract audio URL from response
    if (!data || (!data.audio_url && !data.url)) {
      console.error('Invalid API Response:', data);
      throw new Error('No audio URL in API response');
    }

    const audioUrl = data.audio_url || data.url;
    console.log('Generated audio URL:', audioUrl);
    return audioUrl;

  } catch (error) {
    console.error('Error in generateAudio:', error);
    throw error instanceof Error ? error : new Error('Failed to generate audio');
  }
}