const axios = require('axios');

class ChatAgent {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.basePrompt = `You are an official institutional assistant. Follow these rules:
1. Be precise and factual
2. Use markdown links for sources
3. Never invent information
4. Keep responses under 150 words`;
  }

  async generateResponse(query, context) {
    const messages = [{
      role: "system",
      content: `${this.basePrompt}\nContext:\n${JSON.stringify(context, null, 2)}`
    }, {
      role: "user",
      content: query
    }];

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          "model": "meta-llama/llama-3.3-8b-instruct:free",
          messages,
        },
        { 
          headers: { 
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': process.env.SITE_URL || 'https://lumthrong.github.io/'
          },
          timeout: 100000 // 10 seconds
        }
      );
      
      return this.formatResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('AI Error:', error.response?.data || error.message);
      return null;
    }
  }

  formatResponse(text) {
    // Convert [PageName] to proper links
    return text.replace(
      /\[(.*?)\]/g, 
      (match, p1) => `<a href="#" class="page-link" data-pagename="${p1}">${p1} Page</a>`
    );
  }
}

module.exports = ChatAgent;
