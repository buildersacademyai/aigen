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

    // For video URL, we'll use a placeholder until proper video generation is implemented
    const videoUrl = "https://example.com/placeholder-video.mp4";

    return {
      ...result,
      imageUrl: imageResponse.data[0].url,
      videoUrl: videoUrl
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate article: " + errorMessage);
  }
}
