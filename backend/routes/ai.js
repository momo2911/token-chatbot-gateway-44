
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for chat sessions (in a real app, use a database)
const chatSessions = new Map();

// Get chat history for a user
router.get('/chat/history/:userId', (req, res) => {
  const { userId } = req.params;
  const userHistory = chatSessions.get(userId) || [];
  res.json({ success: true, history: userHistory });
});

// Endpoint to handle AI chat
router.post('/chat', async (req, res) => {
  try {
    const { prompt, history = [], userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Log the request
    console.log('Received request:', { prompt, historyLength: history.length, userId });
    
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
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
    });
    
    const response = completion.choices[0].message.content;
    
    // Update chat history
    const userHistory = chatSessions.get(userId) || [];
    const newMessages = [
      ...userHistory,
      { role: 'user', content: prompt, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date() }
    ];
    chatSessions.set(userId, newMessages);
    
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
