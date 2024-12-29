import { HYPERBOLIC_API_KEY } from "./config";

const HYPERBOLIC_API_URL = 'https://api.hyperbolic.xyz/v1/audio/generation';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateAudio(text: string, speed: number = 1): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES} - Starting audio generation`);
      console.log('Request payload:', { text: text.substring(0, 100) + '...', speed });

      const response = await fetch(HYPERBOLIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`,
        },
        body: JSON.stringify({
          text,
          speed
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid JSON response from API');
      }

      console.log('Parsed API Response:', data);

      // Look for audio URL in various possible response formats
      const audioUrl = data?.audio_url || data?.url || data?.audioUrl || 
                      (data?.data && (data.data?.audio_url || data.data?.url));

      if (!audioUrl) {
        console.error('No audio URL found in response. Full response:', data);
        throw new Error('No audio URL in API response');
      }

      console.log('Successfully generated audio URL:', audioUrl);
      return audioUrl;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Attempt ${attempt} failed:`, lastError);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
      }
    }
  }

  throw new Error(`Failed to generate audio after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}