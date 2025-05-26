const axios = require('axios');
const cheerio = require('cheerio');

const extractContent = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 
        'User-Agent': 'InstitutionalBot/1.0 (+https://lumthrong.github.io/)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const $ = cheerio.load(response.data);
    const metadata = {
      url,
      title: $('title').text().trim(),
      lastUpdated: new Date().toISOString()
    };

    ['nav', 'footer', 'script', 'style'].forEach(tag => $(tag).remove());

    const content = [];
    $('h1, h2, h3').each((i, el) => {
      const section = {
        header: $(el).text().trim(),
        content: $(el).nextUntil('h1, h2, h3').text().trim().replace(/\s+/g, ' '),
        keywords: []
      };
      if (section.header && section.content) {
        section.keywords = extractKeywords(`${section.header} ${section.content}`);
        content.push(section);
      }
    });

    // Fallback to paragraph extraction if no headings
    if (content.length === 0) {
      const paragraphText = $('p').text().trim().replace(/\s+/g, ' ');
      if (paragraphText.length > 50) {
        content.push({
          header: 'General Information',
          content: paragraphText.slice(0, 1000),
          keywords: extractKeywords(paragraphText)
        });
      }
    }

    return { ...metadata, content };
  } catch (error) {
    console.error(`Scraping failed for ${url}:`, error.message);
    return {
      url,
      error: `Content unavailable (${error.code || 'TIMEOUT'})`,
      content: []
    };
  }
};

const extractKeywords = (text) => {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'your', 'will',
    'are', 'was', 'were', 'been', 'about', 'more', 'such', 'into', 'only', 'when',
    'then', 'than', 'them', 'they', 'what', 'which', 'while', 'there', 'their'
  ]);

  return [...new Set(
    text.toLowerCase()
      .match(/\b[\w']+(?:-\w+)*\b/g)
      ?.filter(word => word.length > 3 && !stopWords.has(word.trim()))
      .slice(0, 15)
  )] || [];
};

module.exports = { extractContent, extractKeywords };
