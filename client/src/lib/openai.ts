import OpenAI from "openai";
import { gatherRelatedContent } from './scraper';

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error("OpenAI API key is required. Please set VITE_OPENAI_API_KEY environment variable.");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export async function generateArticle(topic: string) {
  try {
    console.log('Starting article generation for topic:', topic);
    
    // First, gather related content
    const relatedContent = await gatherRelatedContent(topic);
    console.log('Gathered related content:', relatedContent.length, 'items');
    
    // Prepare context from search results
    const context = relatedContent
      .map(result => `
Source: ${result.link}
Title: ${result.title}
Summary: ${result.snippet}
      `)
      .join('\n\n');

    console.log('Sending request to OpenAI');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert content writer. Generate a comprehensive article about the given topic.
Instructions:
1. Make the article informative and engaging
2. Include relevant examples and explanations
3. Structure the content with clear sections
4. Keep technical terms accessible

Respond with JSON in this format:
{
  "title": "string (attractive, SEO-friendly title)",
  "description": "string (2-3 sentences summarizing the article)",
  "content": "string (full article content with proper formatting)"
}`
        },
        {
          role: "user",
          content: `Write an article about ${topic}. Use this research context to inform your writing:\n\n${context}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    console.log('Received response from OpenAI');
    const result = JSON.parse(content);
    
    console.log('Generating article image');
    // Generate image for the article with more specific prompt
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a high-quality, professional image for an article about ${topic}. Requirements:
1. Modern and professional style
2. Clear focal point related to ${topic}
3. Suitable for article header
4. Clean, minimal composition
5. Bright, well-lit scene`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }).catch(error => {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate article image: ' + error.message);
    });

    if (!imageResponse?.data?.[0]?.url) {
      throw new Error('No image URL received from DALL-E');
    }

    console.log('Converting image to base64');
    // Fetch and convert the image to base64
    const imageUrl = imageResponse.data[0].url;
    const imageResponse2 = await fetch(imageUrl).catch(error => {
      console.error('Image fetch error:', error);
      throw new Error('Failed to fetch generated image: ' + error.message);
    });

    const imageBuffer = await imageResponse2.arrayBuffer();
    const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`;

    // Select an appropriate video URL based on the topic
    const videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    console.log('Article generation complete');
    return {
      ...result,
      imageUrl: base64Image,
      videoUrl: videoUrl
    };
  } catch (error) {
    console.error('Article generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate article: " + errorMessage);
  }
}
