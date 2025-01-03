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
          num: 5, // Limit to top 5 most relevant results
          fields: 'items(title,snippet,link)',
          safe: 'active',
          sort: 'relevance'
        }
      }
    );

    if (!response.data.items) {
      console.log('No search results found for topic:', topic);
      return [];
    }

    // Filter out any non-http(s) links and format results
    const results = response.data.items
      .filter((item: any) => item.link.startsWith('http'))
      .map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link
      }));

    console.log(`Found ${results.length} valid sources for topic:`, topic);
    return results;
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
}