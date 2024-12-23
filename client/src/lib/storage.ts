import fetch from "node-fetch";
import sharp from "sharp";

export async function processImageFromUrl(imageUrl: string): Promise<{ data: Buffer; type: string }> {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    const buffer = await response.arrayBuffer();

    // Process image with sharp
    const processedImage = await sharp(buffer)
      .jpeg({ quality: 80 })
      .toBuffer();

    return {
      data: processedImage,
      type: 'image/jpeg'
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

export function getImageUrl(articleId: number): string {
  return `/api/articles/${articleId}/image`;
}
