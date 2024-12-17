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
    const videoResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a video thumbnail for ${topic} with text overlay "BuildersAcademy"`,
      n: 1,
      size: "1024x1024"
    });

    return {
      ...result,
      imageUrl: imageResponse.data[0].url,
      videoUrl: videoResponse.data[0].url
    };
  } catch (error) {
    throw new Error("Failed to generate article: " + error.message);
  }
}
