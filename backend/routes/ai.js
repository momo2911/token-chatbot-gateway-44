
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to handle AI chat
router.post('/chat', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;
    
    // Log the request
    console.log('Received request:', { prompt, historyLength: history.length });
    
    // Format messages for OpenAI
    const messages = [
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: prompt }
    ];
    
    // Make request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // You can change this to other models
      messages: messages,
      temperature: 0.7,
    });
    
    const response = completion.choices[0].message.content;
    
    // Calculate token usage
    const promptTokens = completion.usage.prompt_tokens;
    const completionTokens = completion.usage.completion_tokens;
    const totalTokens = completion.usage.total_tokens;
    
    console.log('Token usage:', { promptTokens, completionTokens, totalTokens });
    
    // Return the response
    res.json({
      success: true,
      response,
      tokenUsage: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      }
    });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get AI response'
    });
  }
});

module.exports = router;
