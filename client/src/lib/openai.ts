import OpenAI from "openai";
import { gatherRelatedContent } from './scraper';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

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
          content: "You are an expert content writer. Using the provided research context, generate a comprehensive article. The article should be original, engaging, and well-structured. Respond with JSON in this format: { title: string, content: string, description: string }"
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

    // Select an appropriate video based on the topic
    let videoUrl;
    if (topic.toLowerCase().includes('web3') || topic.toLowerCase().includes('blockchain')) {
      videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"; // Futuristic tech video
    } else if (topic.toLowerCase().includes('ai') || topic.toLowerCase().includes('machine learning')) {
      videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"; // AI/Tech focused
    } else {
      videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Default tech video
    }

    // Fetch and convert the image to base64
    const imageUrl = imageResponse.data[0].url;
    if (!imageUrl) throw new Error("Failed to generate image");
    
    try {
      const imageResponse2 = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg, image/png, image/*'
        }
      });
      
      if (!imageResponse2.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse2.status} ${imageResponse2.statusText}`);
      }
      
      const contentType = imageResponse2.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const imageBuffer = await imageResponse2.arrayBuffer();
      if (!imageBuffer || imageBuffer.byteLength === 0) {
        throw new Error('Empty image buffer received');
      }

      const base64Image = `data:${contentType};base64,${Buffer.from(imageBuffer).toString('base64')}`;

      // Verify the base64 string is valid and has content
      if (!base64Image.startsWith('data:image/') || base64Image.length < 100) {
        throw new Error("Invalid base64 image data");
      }

      return {
        ...result,
        imageUrl: base64Image,
        videoUrl: videoUrl
      };
    } catch (error) {
      console.error('Image processing error:', error);
      // Provide a fallback image URL when the main image fails
      return {
        ...result,
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyMjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiPkltYWdlIGdlbmVyYXRpb24gZmFpbGVkPC90ZXh0Pjwvc3ZnPg==',
        videoUrl: videoUrl
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate article: " + errorMessage);
  }
}
