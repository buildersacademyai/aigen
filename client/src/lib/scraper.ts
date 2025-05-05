import axios from 'axios';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

// Using environment variables for Google API credentials
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;

// Function to get fallback sources based on the topic
function getFallbackSources(topic: string): SearchResult[] {
  console.log('Using fallback sources for topic:', topic);
  
  // Determine topic category and return relevant fallback sources
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes('blockchain') || lowerTopic.includes('crypto') || lowerTopic.includes('web3')) {
    return [
      {
        title: "Web3 Development Guide",
        snippet: "Introduction to blockchain and decentralized application development.",
        link: "https://ethereum.org/en/developers/"
      },
      {
        title: "Blockchain Technology Explained",
        snippet: "Overview of blockchain technology, its applications and potential.",
        link: "https://www.ibm.com/topics/blockchain"
      },
      {
        title: "Decentralized Finance (DeFi) Explained",
        snippet: "Understanding the revolution in financial services through blockchain.",
        link: "https://ethereum.org/en/defi/"
      }
    ];
  } else if (lowerTopic.includes('ai') || lowerTopic.includes('machine learning') || lowerTopic.includes('artificial intelligence')) {
    return [
      {
        title: "Getting Started with AI",
        snippet: "Learn about artificial intelligence and its applications in modern technology.",
        link: "https://www.ibm.com/topics/artificial-intelligence"
      },
      {
        title: "Machine Learning Overview",
        snippet: "Comprehensive introduction to machine learning concepts and applications.",
        link: "https://www.ibm.com/topics/machine-learning"
      },
      {
        title: "AI Research at OpenAI",
        snippet: "Latest developments in artificial intelligence research and applications.",
        link: "https://openai.com/research/"
      }
    ];
  } else {
    // Default technology sources
    return [
      {
        title: "Understanding Web Development",
        snippet: "A comprehensive guide to modern web development practices and technologies.",
        link: "https://developer.mozilla.org/en-US/docs/Learn"
      },
      {
        title: "Web Technology for Developers",
        snippet: "Comprehensive resource for web technology, standards and best practices.",
        link: "https://developer.mozilla.org/en-US/docs/Web"
      },
      {
        title: "Digital Technology Trends",
        snippet: "Overview of current technological innovations and future directions.",
        link: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights"
      }
    ];
  }
}

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
      return getFallbackSources(topic);
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
    return getFallbackSources(topic);
  }
}