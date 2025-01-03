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

const generateAudio = async (text: string, articleId: number): Promise<{ url: string, duration: number }> => {
  try {
    // Generate speech using OpenAI
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Convert the response to a blob
    const audioBlob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' });

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
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export async function generateArticle(topic: string) {
  try {
    // First, gather related content
    const relatedContent = await gatherRelatedContent(topic);

    // Prepare context from search results
    const context = relatedContent
      .map(result => `
Source: ${result.link}
Title: ${result.title}
Summary: ${result.snippet}
      `)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content writer. Using the provided research context, generate a comprehensive article. The article should be original, engaging, and well-structured. Respond with JSON in this format: { title: string, content: string, description: string, summary: string }"
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

    // Generate image for the article with more specific prompt
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

    // Save the main article image
    const persistedImageUrl = await saveImage(imageResponse.data[0].url);

    // Generate video thumbnail image with watermark
    const thumbnailResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a cinematic thumbnail for "${topic}". Requirements:
1. Professional tech-focused composition
2. Include "BuildersAcademy" watermark in bottom right (80% opacity)
3. High contrast and modern design style
4. Visual elements representing ${topic}
5. Suitable for a video cover image`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    if (!thumbnailResponse.data[0]?.url) {
      throw new Error("No thumbnail URL received from OpenAI");
    }

    // Save the thumbnail image
    const persistedThumbnailUrl = await saveImage(thumbnailResponse.data[0].url);

    // Generate audio for the article
    const audio = await generateAudio(result.content, 1); // Assuming articleId is 1 for now. This should be replaced with a dynamic article ID.

    // Select an appropriate video based on the topic
    let videoUrl;
    if (topic.toLowerCase().includes('web3') || topic.toLowerCase().includes('blockchain')) {
      videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
    } else if (topic.toLowerCase().includes('ai') || topic.toLowerCase().includes('machine learning')) {
      videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4";
    } else {
      videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }

    return {
      ...result,
      imageUrl: persistedImageUrl,
      videoUrl: videoUrl,
      thumbnailUrl: persistedThumbnailUrl,
      audioUrl: audio.url,
      audioDuration: audio.duration
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate article: " + errorMessage);
  }
}