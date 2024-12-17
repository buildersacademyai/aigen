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

    // Generate video with watermark
    const videoResponse = await openai.videos.generate({
      model: "deepmotion-1",
      prompt: `Create a cinematic and visually striking 15-second video for "${topic}". Requirements:
1. Make it dynamic and engaging with smooth transitions
2. Add a professional background music track that fits the tech/educational theme
3. Include "BuildersAcademy" watermark in bottom right (80% opacity)
4. Use modern, high-end visuals suitable for a tech platform
5. Incorporate visual elements that represent ${topic}
6. Add subtle motion graphics and text overlays to highlight key points`,
      duration: 15,
      quality: "premium",
      format: "mp4",
      output_audio: true,
      style: "cinematic"
    });

    return {
      ...result,
      imageUrl: imageResponse.data[0].url,
      videoUrl: videoResponse.data[0].url
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to generate article: " + errorMessage);
  }
}
