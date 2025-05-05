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

// Define the article generation result interface
interface ArticleGenerationResult {
  title: string;
  content: string;
  description: string;
  summary: string;
  imageUrl: string;
  thumbnailUrl?: string;
  videoUrl: string;
  videoDuration: number;
  audioUrl: string;
  audioDuration: number;
  sourceLinks: string[];
}

// Define a more user-friendly function for article generation
// This function will handle API errors gracefully
export async function generateArticle(topic: string): Promise<ArticleGenerationResult> {
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

    // Use the proxy to call OpenAI API via our secure server endpoint
    const response = await openaiProxy.chat.completions.create({
      model: "gpt-4", // the newest OpenAI model available
      messages: [
        {
          role: "system",
          content: `You are an expert content creator who writes engaging, informative articles. 
          Your task is to create a comprehensive article about the given topic.
          Use the provided context from reliable sources to inform your writing.
          Create a well-structured article with a catchy title, introduction, main sections, and conclusion.
          Include cited sources at the end of the article.`
        },
        {
          role: "user",
          content: `Create an article about "${topic}" based on the following source information:
          ${context}
          
          Format the response as a JSON object with the following fields:
          - title: A catchy and SEO-friendly title
          - content: The complete article content in markdown format, including headings, paragraphs, and the provided source links section
          - description: A short 1-2 sentence description of the article
          - summary: A 3-4 sentence summary of the key points`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure the content includes our source links section
    if (!result.content.includes("Reference Sources")) {
      result.content += sourceLinksSection;
    }
    
    emitProgress(GENERATION_EVENTS.CONTENT_GENERATED);

    // Generate image for the article using proxy
    const imageResponse = await openaiProxy.images.generate({
      model: "dall-e-3",
      prompt: `Create a high-quality, professional image that represents an article about ${topic}. Make it visually striking and memorable, with clear subject matter and good composition. Style: modern, professional, editorial.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!imageResponse.data[0]?.url) {
      throw new Error("No image URL received from OpenAI");
    }

    // Save the image
    const persistedImageUrl = await saveImage(imageResponse.data[0].url);
    emitProgress(GENERATION_EVENTS.IMAGE_CREATED);

    // Generate audio for the article content
    const { audioBlob, duration } = await generateAudio(result.content);

    // Create the article with all media content
    const articleResponse = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: result.title,
        content: result.content,
        description: result.description,
        summary: result.summary,
        imageurl: persistedImageUrl,
        videourl: "", // We'll skip video for now
        videoduration: 0,
        authoraddress: "0x0000000000000000000000000000000000000000", // Will be replaced with actual wallet address
        signature: "",
        isdraft: true,
        sourcelinks: JSON.stringify(sourceLinks)
      })
    });

    if (!articleResponse.ok) {
      throw new Error("Failed to create article");
    }

    const article = await articleResponse.json();
    emitProgress(GENERATION_EVENTS.ARTICLE_SAVED);

    // Save the audio with the article ID
    const audio = await saveAudio(audioBlob, article.id);
    emitProgress(GENERATION_EVENTS.AUDIO_CREATED);

    // Update the article with audio information
    const updateResponse = await fetch(`/api/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audiourl: audio.url,
        audioduration: audio.duration,
        sourcelinks: JSON.stringify(sourceLinks)
      })
    });

    if (!updateResponse.ok) {
      throw new Error("Failed to update article with audio information");
    }

    return {
      ...result,
      imageUrl: persistedImageUrl,
      videoUrl: "",
      videoDuration: 0,
      audioUrl: audio.url,
      audioDuration: audio.duration,
      sourceLinks
    };
  } catch (error) {
    console.error('Article generation error:', error);
    throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}