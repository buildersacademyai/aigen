import axios from 'axios';
import * as cheerio from 'cheerio';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  content?: string;
}

async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove non-content elements
    $('script, style, header, footer, nav, iframe, .ad, .advertisement, .social-share').remove();
    
    // Get the main content
    let content = '';
    const mainSelectors = ['article', 'main', '.content', '#content', '.post', '.article-content'];
    
    for (const selector of mainSelectors) {
      const element = $(selector).first();
      if (element.length) {
        content = element.text();
        break;
      }
    }
    
    if (!content) {
      content = $('body').text();
    }
    
    // Clean up the content
    return content
      .replace(/\s+/g, ' ')
      .replace(/\[\d+\]/g, '') // Remove reference numbers
      .trim();
      
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return null;
  }
}

export async function gatherRelatedContent(topic: string): Promise<SearchResult[]> {
  try {
    console.log('Gathering content for topic:', topic);
    
    const response = await axios.get('https://customsearch.googleapis.com/customsearch/v1', {
      params: {
        key: import.meta.env.VITE_GOOGLE_API_KEY,
        cx: import.meta.env.VITE_GOOGLE_CSE_ID,
        q: topic,
        num: 5,
        fields: 'items(title,snippet,link)',
        rights: 'cc_publicdomain,cc_sharealike',
        safe: 'active'
      }
    });

    if (!response.data?.items?.length) {
      console.log('No search results found for:', topic);
      return [];
    }

    console.log(`Found ${response.data.items.length} search results`);

    const results = response.data.items.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link
    }));

    // Fetch content for each result in parallel with a concurrency limit
    const contentPromises = results.map(async (result, index) => {
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, index * 1000));
      console.log('Fetching content from:', result.link);
      const content = await fetchPageContent(result.link);
      return { ...result, content };
    });

    const enrichedResults = await Promise.all(contentPromises);
    const validResults = enrichedResults.filter(result => result.content) as SearchResult[];
    
    console.log(`Successfully gathered content from ${validResults.length} sources`);
    return validResults;
  } catch (error) {
    console.error('Error in gatherRelatedContent:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Response:', error.response.data);
    }
    return [];
  }
}
