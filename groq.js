require('dotenv').config();
const axios = require('axios');

class ChatAgent {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY; // Use GROQ_API_KEY in .env
    this.basePrompt = `You are Martin, an official institutional assistant. Follow these rules:
1. Be precise and factual.
2. Do not include any links unless explicitly provided.
3. Never invent information.
4. Summarize the content.`;
  }

  async generateResponse(query, context) {
    const messages = [
      {
        role: "system",
        content: `${this.basePrompt}\nContext:\n${JSON.stringify(context, null, 2)}`
      },
      {
        role: "user",
        content: query
      }
    ];

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return this.formatResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('AI Error:', error.response?.data || error.message);
      return null;
    }
  }

  formatResponse(text) {
    return text.replace(
      /(.*?)/g,
      (match, p1) => `<a href="#" class="page-link" data-pagename="${p1}">${p1} Page</a>`
    );
  }
}

module.exports = ChatAgent;