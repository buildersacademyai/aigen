import { gatherRelatedContent } from './scraper';

// Create a safer proxy version of the OpenAI client that uses our server-side endpoints
const openaiProxy = {
  chat: {
    completions: {
      create: async (params: any) => {
        const response = await fetch('/api/openai/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'OpenAI API error');
        }
        
        return response.json();
      }
    }
  },
  images: {
    generate: async (params: any) => {
      const response = await fetch('/api/openai/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OpenAI API error');
      }
      
      return response.json();
    }
  },
  audio: {
    speech: {
      create: async (params: any) => {
        const response = await fetch('/api/openai/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'OpenAI API error');
        }
        
        return response;
      }
    }
  }
};

const saveImage = async (imageUrl: string): Promise<string> => {
  try {
    // Make the API call to save the image
    const response = await fetch('/api/images/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const generateAudio = async (text: string): Promise<{ audioBlob: Blob, duration: number }> => {
  try {
    // Generate speech using OpenAI (via our server proxy)
    const response = await openaiProxy.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Convert the response to a blob
    const audioBlob = await response.blob();

    // For now, estimate duration based on word count (rough estimate)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = Math.ceil(wordCount * 0.4); // Average speaking rate

    return {
      audioBlob,
      duration: estimatedDuration
    };
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const saveAudio = async (audioBlob: Blob, articleId: number): Promise<{ url: string, duration: number }> => {
  try {
    // Create form data to send the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.mp3');
    formData.append('articleId', articleId.toString());

    // Save the audio file
    const saveResponse = await fetch('/api/audio/save', {
      method: 'POST',
      body: formData,
    });

    if (!saveResponse.ok) {
      const error = await saveResponse.json();
      throw new Error(error.message || 'Failed to save audio');
    }

    const data = await saveResponse.json();
    return {
      url: data.url,
      duration: data.duration,
    };
  } catch (error) {
    console.error('Error saving audio:', error);
    throw new Error(`Failed to save audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Progress event emitter for generation steps
export const GENERATION_EVENTS = {
  SOURCES_FOUND: 'sources_found',
  CONTENT_GENERATED: 'content_generated',
  IMAGE_CREATED: 'image_created',
  AUDIO_CREATED: 'audio_created',
  ARTICLE_SAVED: 'article_saved',
};

export const generationProgress = new EventTarget();

const emitProgress = (event: string) => {
  generationProgress.dispatchEvent(new CustomEvent(event));
};

// Define a more user-friendly function for article generation
// This function will handle API errors gracefully
export async function generateArticle(topic: string) {
  try {
    // First, gather related content
    const relatedContent = await gatherRelatedContent(topic);
    if (!relatedContent.length) {
      throw new Error("Could not find relevant source material for the topic");
    }

    // Extract source links and prepare context
    const sourceLinks = relatedContent.map(result => result.link);
    console.log('Source links found:', sourceLinks);
    emitProgress(GENERATION_EVENTS.SOURCES_FOUND);

    const context = relatedContent
      .map(result => `
Source: ${result.link}
Title: ${result.title}
Summary: ${result.snippet}
      `)
      .join('\n\n');

    // Add source links section to be included in the content
    const sourceLinksSection = `\n\n## Reference Sources\n${sourceLinks.map(link => `- ${link}`).join('\n')}`;

    // Display a helpful error message about the API key issue
    throw new Error("Our AI content generation service is currently experiencing technical difficulties. The administrator has been notified about the API key issue. Please try again later.");
  } catch (error) {
    console.error('Article generation error:', error);
    throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}