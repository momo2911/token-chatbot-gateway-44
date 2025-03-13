
import { Message } from "@/components/ResponseDisplay";
import { secureApiPost, secureApiGet } from "./api";

// Get AI response from our backend
export async function getAIResponse(
  prompt: string, 
  history: Message[] = []
): Promise<string> {
  console.log("Sending request to backend API...");
  console.log("Prompt:", prompt);
  console.log("History:", history);
  
  try {
    const data = await secureApiPost('/ai/chat', {
      prompt,
      history: history.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
    
    if (data.tokenUsage) {
      console.log('Token usage:', data.tokenUsage);
    }
    
    return data.response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

// Get chat history for current user
export async function getChatHistory(): Promise<Message[]> {
  try {
    const data = await secureApiGet('/ai/chat/history');
    return data.history || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
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
