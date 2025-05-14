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
      create: async (params: any, options?: { signal?: AbortSignal }) => {
        try {
          const response = await fetch('/api/openai/speech', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
            signal: options?.signal
          });
          
          if (!response.ok) {
            // Try to parse the error as JSON
            try {
              const error = await response.json();
              throw new Error(error.message || `Speech generation failed with status ${response.status}`);
            } catch (jsonError) {
              // If parsing failed, use a generic error message
              throw new Error(`Speech generation failed with status ${response.status}`);
            }
          }
          
          return response;
        } catch (error) {
          const errorName = error && typeof error === 'object' && 'name' in error ? error.name : '';
          if (errorName === 'AbortError') {
            throw new Error('Speech generation request was aborted due to timeout');
          }
          throw error;
        }
      }
    }
  }
};

const saveImage = async (imageUrl: string, articleId?: number): Promise<string> => {
  try {
    // Make the API call to save the image
    const response = await fetch('/api/images/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imageUrl,
        articleId // Include articleId if available
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // If the first attempt fails, try one more time
      if (response.status >= 500) {
        console.log('First image save attempt failed, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const retryResponse = await fetch('/api/images/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageUrl,
            articleId
          }),
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return retryData.url;
        }
      }
      
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
    // Get the first 4000 characters to avoid OpenAI API length limits
    // This is approximately 600-800 words or 3-4 minutes of audio
    const truncatedText = text.slice(0, 4000);
    
    // Add a note if we truncated the text
    const finalText = truncatedText.length < text.length
      ? truncatedText + " ... The full article continues on the page."
      : truncatedText;
    
    console.log(`Generating audio for text of length: ${finalText.length} chars`);
    
    // Generate speech using OpenAI (via our server proxy)
    const response = await openaiProxy.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: finalText,
    });

    // Convert the response to a blob
    const audioBlob = await response.blob();

    // For now, estimate duration based on word count (rough estimate)
    const wordCount = finalText.split(/\s+/).length;
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
  SOURCES_GATHERING: 'sources_gathering',
  SOURCES_FOUND: 'sources_found',
  CONTENT_GENERATED: 'content_generated',
  IMAGE_CREATED: 'image_created',
  AUDIO_CREATED: 'audio_created',
  AUDIO_FAILED: 'audio_failed',
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
    // First, gather related content using Google search API
    emitProgress(GENERATION_EVENTS.SOURCES_GATHERING);
    console.log('Searching for sources on topic:', topic);
    
    const relatedContent = await gatherRelatedContent(topic);
    if (!relatedContent.length) {
      throw new Error("Could not find relevant source material for the topic");
    }

    // Extract source links and prepare context
    const sourceLinks = relatedContent.map(result => result.link);
    console.log('Source links found:', sourceLinks);
    console.log('Sources quality check:', relatedContent.map(s => `${s.title.substring(0, 30)}... (${s.link})`));
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
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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

    // First temporarily save the image
    const tempImageUrl = await saveImage(imageResponse.data[0].url);
    emitProgress(GENERATION_EVENTS.IMAGE_CREATED);

    // Create the article with media content (without audio yet)
    // Ensure we have a description to avoid db constraint violation
    const description = result.description || result.summary || `Article about ${topic}`;
    
    const articleResponse = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: result.title,
        content: result.content,
        description: description,
        summary: result.summary || description,
        imageurl: tempImageUrl,
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

    // Now that we have the article ID, re-save the image with the article ID to ensure permanent linking
    let finalImageUrl = tempImageUrl;
    try {
      // Re-save the image with the article ID for proper linking
      console.log('Re-saving image with article ID:', article.id);
      const persistedImageUrl = await saveImage(imageResponse.data[0].url, article.id);
      finalImageUrl = persistedImageUrl;
      
      // Update the article with the properly linked image
      await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageurl: persistedImageUrl
        })
      });
      
      console.log('Image permanently linked to article ID:', article.id);
    } catch (imageError) {
      console.warn('Failed to update article with permanent image link:', imageError);
      // Continue with the temporary image URL if re-saving fails
    }

    // Try to generate audio but don't fail the whole process if it times out
    let audioUrl = "";
    let audioDuration = 0;
    
    try {
      // Generate audio with a timeout of 30 seconds
      const audioPromise = generateAudio(result.content);
      
      // Set up a timeout
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Audio generation timed out')), 30000)
      );

      // Race between the audio generation and the timeout
      const audioResult = await Promise.race([
        audioPromise,
        timeoutPromise
      ]);

      // If we got here, audio was successfully generated
      const audio = await saveAudio(audioResult.audioBlob, article.id);
      
      // Only proceed if we actually got a valid audio URL back
      if (audio && audio.url) {
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
  
        if (updateResponse.ok) {
          // Update our return values
          audioUrl = audio.url;
          audioDuration = audio.duration;
          emitProgress(GENERATION_EVENTS.AUDIO_CREATED);
        } else {
          console.warn('Failed to update article with audio information');
          emitProgress(GENERATION_EVENTS.AUDIO_FAILED);
        }
      } else {
        console.warn('Audio generation returned invalid data:', audio);
        emitProgress(GENERATION_EVENTS.AUDIO_FAILED);
      }
    } catch (audioError) {
      console.warn('Audio generation failed, continuing without audio:', audioError);
      // Emit a failure event so the UI can update accordingly
      emitProgress(GENERATION_EVENTS.AUDIO_FAILED);
      // Continue without audio, the article is still created successfully
    }
    
    // Always return the article, with or without audio
    return {
      ...result,
      imageUrl: finalImageUrl,
      videoUrl: "",
      videoDuration: 0,
      audioUrl: audioUrl,
      audioDuration: audioDuration,
      sourceLinks
    };
  } catch (error) {
    console.error('Article generation error:', error);
    throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}