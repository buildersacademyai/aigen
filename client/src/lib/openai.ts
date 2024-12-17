import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export async function generateArticle(topic: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate an informative article with a title and content. Respond with JSON in this format: { title: string, content: string, description: string }"
        },
        {
          role: "user",
          content: `Write an article about ${topic}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    const result = JSON.parse(content);
    
    // Generate image for the article
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create an image for an article about ${topic}`,
      n: 1,
      size: "1024x1024"
    });

    // Generate video thumbnail with watermark
    const videoThumbnail = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a cinematic and dynamic 16:9 video thumbnail for "${topic}". Follow these requirements:
1. The scene should be visually striking and suggest motion
2. Add a large, prominent "BuildersAcademy" watermark in a professional sans-serif font
3. Position the watermark in the bottom right corner with 80% opacity
4. Use a subtle drop shadow on the watermark to ensure readability
5. The overall style should be modern and high-end, suitable for a tech platform
6. Include visual elements that reinforce the topic's theme`,
      n: 1,
      size: "1792x1024",
      quality: "hd",
      style: "vivid"
    });

    // For demo purposes, we'll use a sample video URL since OpenAI doesn't have video generation
    // In a production environment, you would integrate with a video generation service
    const demoVideoUrl = "https://storage.googleapis.com/webfundamentals-assets/videos/chrome.mp4";

    return {
      ...result,
      imageUrl: imageResponse.data[0].url,
      videoUrl: demoVideoUrl // Using demo video URL for testing
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate article: " + errorMessage);
  }
}
