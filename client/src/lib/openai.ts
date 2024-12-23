import OpenAI from "openai";
import { gatherRelatedContent } from './scraper';
import { processImageFromUrl } from './storage';

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
    
    if (relatedContent.length === 0) {
      throw new Error("No research content found for the topic");
    }
    
    // Prepare context from search results, including full content where available
    const context = relatedContent
      .map(result => `
Source: ${result.link}
Title: ${result.title}
Summary: ${result.snippet}
Content: ${result.content || 'No detailed content available'}
      `)
      .join('\n\n');

    console.log('Generating article content with OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert content writer specializing in Web3, blockchain, and emerging technologies. 
Using the provided research context, generate a comprehensive article that is:
1. Original and well-researched
2. Engaging and accessible to a technical audience
3. Well-structured with clear sections
4. Focused on practical insights and real-world applications

Your response must be in this JSON format:
{
  "title": "string (compelling title)",
  "description": "string (2-3 sentences summary)",
  "content": "string (full article with markdown formatting)"
}`
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
    
    console.log('Generating article image...');
    // Generate image with a more detailed prompt based on the article content
    const imagePrompt = `Create a high-quality, professional image for an article titled "${result.title}". 
Style: Modern tech illustration, minimalist, professional
Theme: Web3, blockchain, digital innovation
Composition: Clear focal point, balanced layout, subtle tech elements
Colors: Rich, vibrant, professional palette
Must not include: Text overlays, human faces, copyrighted logos`;

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid"
    });

    console.log('Processing generated image...');
    // Get the image URL from the response
    const imageUrl = imageResponse.data[0].url;
    
    // Process and optimize the image for storage
    const { data: imageData, type: imageType } = await processImageFromUrl(imageUrl);

    // Select an appropriate video based on the topic
    console.log('Selecting appropriate video...');
    const videoUrl = topic.toLowerCase().includes('web3') || topic.toLowerCase().includes('blockchain')
      ? "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      : topic.toLowerCase().includes('ai') || topic.toLowerCase().includes('machine learning')
      ? "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
      : "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    console.log('Article generation complete');
    return {
      ...result,
      imageData,
      imageType,
      videoUrl
    };
  } catch (error) {
    console.error('Error in generateArticle:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate article: " + errorMessage);
  }
}
