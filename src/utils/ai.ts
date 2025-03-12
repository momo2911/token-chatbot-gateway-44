
import { Message } from "@/components/ResponseDisplay";

// API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/ai';

// Get AI response from our backend
export async function getAIResponse(
  prompt: string, 
  history: Message[] = []
): Promise<string> {
  console.log("Sending request to backend API...");
  console.log("Prompt:", prompt);
  console.log("History:", history);
  
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        history: history.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }
    
    const data = await response.json();
    
    if (data.tokenUsage) {
      console.log('Token usage:', data.tokenUsage);
    }
    
    return data.response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

// Calculate token consumption (frontend estimation)
export function calculateTokenConsumption(text: string): number {
  // This is just a rough estimate - actual token count comes from the backend
  const characterCount = text.length;
  return Math.ceil(characterCount / 3.5);
}

// Estimate cost in tokens
export function estimateCost(tokenCount: number): number {
  // Sample rate: 0.01 token per character (fictitious rate for demo purposes)
  return tokenCount;
}
