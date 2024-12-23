import axios from 'axios';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

export async function gatherRelatedContent(topic: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1`, {
        params: {
          key: import.meta.env.VITE_GOOGLE_API_KEY,
          cx: import.meta.env.VITE_GOOGLE_CSE_ID,
          q: topic,
          num: 5,
          fields: 'items(title,snippet,link)'
        }
      }
    );
    
    if (!response.data.items) {
      return [];
    }

    return response.data.items.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link
    }));
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
}
