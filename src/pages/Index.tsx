
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ImageUploader } from '@/components/ImageUploader';
import { TextInput } from '@/components/TextInput';
import { ResponseDisplay, Message } from '@/components/ResponseDisplay';
import { AIModel, getAIResponse, calculateTokenConsumption, estimateCost } from '@/utils/ai';
import { isAuthenticated } from '@/utils/auth';
import { useToast } from "@/hooks/use-toast";
import { generateId } from '@/lib/utils';
import { ModelSelector } from '@/components/ModelSelector';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleSendMessage = async (text: string) => {
    if (isProcessing) return;
    
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Calculate token consumption
      const tokenCount = calculateTokenConsumption(text);
      const cost = estimateCost(tokenCount, selectedModel);
      
      console.log(`Estimated token consumption: ${tokenCount}`);
      console.log(`Estimated cost: ${cost} tokens`);
      console.log(`Using model: ${selectedModel}`);
      
      // Get AI response
      const response = await getAIResponse(text, messages, selectedModel);
      
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Lỗi",
        description: "Không thể nhận phản hồi từ AI. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setExtractedText('');
    }
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-block">
            <h3 className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground uppercase tracking-wider">
              AI Token Gateway
            </h3>
          </div>
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isProcessing}
          />
        </div>
        <h1 className="text-3xl font-bold mb-2">Cuộc trò chuyện</h1>
        <p className="text-muted-foreground mb-6">
          Tải lên hình ảnh hoặc nhập trực tiếp tin nhắn của bạn
        </p>
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 pr-1">
          <ResponseDisplay 
            messages={messages} 
            isLoading={isProcessing}
          />
        </div>
        
        {/* Input Area */}
        <div className="space-y-4">
          <ImageUploader 
            onTextExtracted={handleTextExtracted} 
            className="mb-4"
          />
          
          <TextInput 
            onSend={handleSendMessage} 
            initialText={extractedText}
            disabled={isProcessing}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
