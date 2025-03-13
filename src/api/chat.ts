// Define interfaces
export interface ChatRequest {
  userId: string;
  history?: [];
  prompt: string;
  imageUrl?: string;
}

export interface ChatResponse {
  response?: string;
  error?: string;
}

// API endpoint for chat completion
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  
  try {
    const response = await fetch('http://localhost:3001/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      error: 'Failed to connect to the server. Please try again later.'
    };
  }
};

// API endpoint for text completion
export interface CompletionRequest {
  prompt: string;
  imageUrl?: string;
}

export const sendCompletionRequest = async (request: CompletionRequest): Promise<ChatResponse> => {
  try {
    const response = await fetch('/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Completion API error:', error);
    return {
      error: 'Failed to connect to the server. Please try again later.'
    };
  }
};
