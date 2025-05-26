const axios = require('axios');
const cheerio = require('cheerio');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const extractContent = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InstitutionalBot/1.0; +https://lumthrong.github.io)',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    // Parse with Readability
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const $ = cheerio.load(article?.content || response.data);
    const metadata = {
      url,
      title: article?.title || $('title').first().text().trim() || 'No title',
      lastUpdated: new Date().toISOString(),
      excerpt: article?.excerpt || '',
      status: 'success'
    };

    // Clean unnecessary elements
    ['nav', 'footer', 'script', 'style', 'noscript', 'svg'].forEach(tag => $(tag).remove());

    // Extract structured content
    const content = [];
    $('h1, h2, h3').each((i, el) => {
      const $el = $(el);
      const section = {
        header: $el.text().trim(),
        content: $el.nextUntil('h1, h2, h3').text()
          .trim()
          .replace(/\s+/g, ' ')
          .substring(0, 500),
        keywords: [],
        score: 0
      };
      
      if (section.content.length > 10) {
        section.keywords = extractKeywords(`${section.header} ${section.content}`);
        content.push(section);
      }
    });

    return { ...metadata, content };
  } catch (error) {
    console.error(`Scraping failed for ${url}:`, error.message);
    return { 
      url,
      status: 'error',
      error: error.code || 'SCRAPE_FAILED',
      content: [],
      lastUpdated: new Date().toISOString()
    };
  }
};

const extractKeywords = (text) => {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'are', 'you', 'your', 'they',
    'was', 'were', 'their', 'have', 'has', 'been', 'will', 'which', 'not', 'but'
  ]);

  const words = (text.toLowerCase().match(/\b[\w']+(?:-\w+)*\b/g) || [])
    .filter(word => word.length > 3 && !stopWords.has(word));

  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word);
};

module.exports = { extractContent, extractKeywords };
