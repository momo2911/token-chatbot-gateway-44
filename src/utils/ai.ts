
import { Message } from "@/components/ResponseDisplay";
import { secureApiPost, secureApiGet } from "./api";

export type AIModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-3.5-turbo';

// Get AI response from our backend
export async function getAIResponse(
  prompt: string, 
  history: Message[] = [],
  model: AIModel = 'gpt-4o-mini'
): Promise<string> {
  console.log("Sending request to backend API...");
  console.log("Prompt:", prompt);
  console.log("History:", history);
  console.log("Model:", model);
  
  try {
    const data = await secureApiPost('/ai/chat', {
      prompt,
      model,
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
export function estimateCost(tokenCount: number, model: AIModel = 'gpt-4o-mini'): number {
  // Sample rates (multiplier for cost calculation)
  const modelRates: Record<AIModel, number> = {
    'gpt-4o-mini': 1,
    'gpt-4o': 5,
    'gpt-3.5-turbo': 0.5
  };
  
  return tokenCount * modelRates[model];
}

// Get available AI models with their display names and descriptions
export function getAvailableModels(): { id: AIModel; name: string; description: string }[] {
  return [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Fast and cost-effective. Good for most everyday tasks.'
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Most powerful model. Best for complex tasks requiring deep reasoning.'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fastest response time. Best for simple, straightforward tasks.'
    }
  ];
}
