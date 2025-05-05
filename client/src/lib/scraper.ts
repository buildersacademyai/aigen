import axios from 'axios';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

// Using environment variables for Google API credentials
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;

export async function gatherRelatedContent(topic: string): Promise<SearchResult[]> {
  // Validate API key and CSE ID are available
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.warn('Google API credentials missing. Using fallback sources.');
    return getFallbackSources(topic);
  }
  try {
    console.log('Fetching related content for topic:', topic);

    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1', {
        params: {
          key: GOOGLE_API_KEY,
          cx: GOOGLE_CSE_ID,
          q: topic,
          num: 5,
          fields: 'items(title,snippet,link)',
          safe: 'active'
        }
      }
    );

    console.log('Search API response status:', response.status);

    if (!response.data?.items?.length) {
      console.log('No search results found. Response:', response.data);
      // Instead of returning empty array, return some default sources
      return [
        {
          title: "Understanding Web Development",
          snippet: "A comprehensive guide to modern web development practices and technologies.",
          link: "https://developer.mozilla.org/en-US/docs/Learn"
        },
        {
          title: "Getting Started with AI",
          snippet: "Learn about artificial intelligence and its applications in modern technology.",
          link: "https://www.ibm.com/topics/artificial-intelligence"
        },
        {
          title: "Web3 Development Guide",
          snippet: "Introduction to blockchain and decentralized application development.",
          link: "https://ethereum.org/en/developers/"
        }
      ];
    }

    const results = response.data.items
      .filter((item: any) => item.link?.startsWith('http'))
      .map((item: any) => ({
        title: item.title || 'Untitled',
        snippet: item.snippet || 'No description available',
        link: item.link
      }));

    console.log(`Found ${results.length} valid sources for topic:`, topic);
    return results;
  } catch (error) {
    console.error('Search API error:', error);
    // Return default sources instead of empty array
    return [
      {
        title: "Understanding Web Development",
        snippet: "A comprehensive guide to modern web development practices and technologies.",
        link: "https://developer.mozilla.org/en-US/docs/Learn"
      },
      {
        title: "Getting Started with AI",
        snippet: "Learn about artificial intelligence and its applications in modern technology.",
        link: "https://www.ibm.com/topics/artificial-intelligence"
      },
      {
        title: "Web3 Development Guide",
        snippet: "Introduction to blockchain and decentralized application development.",
        link: "https://ethereum.org/en/developers/"
      }
    ];
  }
}