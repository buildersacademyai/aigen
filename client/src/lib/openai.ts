import OpenAI from "openai";
import { gatherRelatedContent } from './scraper';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

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
    // Generate speech using OpenAI
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Convert the response to a blob
    const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });

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

    // Add video section to the content
    const videoSection = "\n\n## Featured Video\nThis article includes a video demonstration to help visualize the concepts discussed.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content writer. Using the provided research context, generate a comprehensive article. The article should be original, engaging, and well-structured. Include proper attribution to sources. Respond with JSON in this format: { title: string, content: string, description: string, summary: string }"
        },
        {
          role: "user",
          content: `Write an article about ${topic}. Use this research context to inform your writing:\n\n${context}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    const result = JSON.parse(content);

    // Append source links and video sections to the generated content
    result.content = `${result.content}${sourceLinksSection}${videoSection}`;

    emitProgress(GENERATION_EVENTS.CONTENT_GENERATED);

    // Generate image for the article
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a high-quality, professional image that represents an article about ${topic}. Make it visually striking and memorable, with clear subject matter and good composition. Style: modern, professional, editorial.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    if (!imageResponse.data[0]?.url) {
      throw new Error("No image URL received from OpenAI");
    }

    // Save the image
    const persistedImageUrl = await saveImage(imageResponse.data[0].url);
    emitProgress(GENERATION_EVENTS.IMAGE_CREATED);

    // Generate video URL (for demonstration, using a placeholder)
    const videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    const videoDuration = 15; // Default duration in seconds

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
        videourl: videoUrl,
        videoduration: videoDuration,
        authoraddress: "0x0000000000000000000000000000000000000000",
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
      videoUrl: videoUrl,
      videoDuration: videoDuration,
      audioUrl: audio.url,
      audioDuration: audio.duration,
      sourceLinks
    };
  } catch (error) {
    console.error('Article generation error:', error);
    throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}