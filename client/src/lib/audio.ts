const HYPERBOLIC_API_URL = 'https://api.hyperbolic.xyz/v1/audio/generation';
const HYPERBOLIC_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0YnVnMzQ3OEBnbWFpbC5jb20iLCJpYXQiOjE3MzU0ODUyMTN9.kAjkSvkjGrKBdw9RfQVGNi5l70W-LxBx7X0OKAHX_ek';

export async function generateAudio(text: string, speed: number = 1): Promise<string> {
  try {
    console.log('Generating audio for text:', text.substring(0, 100) + '...');

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

    if (!response.ok) {
      const error = await response.json();
      console.error('Audio generation failed:', error);
      throw new Error(error.message || 'Failed to generate audio');
    }

    const data = await response.json();
    console.log('Audio generation successful:', data);
    return data.url;
  } catch (error) {
    console.error('Error generating audio:', error);
    // Return empty string instead of throwing to prevent article creation from failing
    return '';
  }
}