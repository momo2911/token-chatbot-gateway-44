
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useSettings } from '@/hooks/useSettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Define interfaces to fix the type errors
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  error?: string;
}

const Index = () => {
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { settings } = useSettings();
  const { tokenBalance } = useTokenBalance();
  const [apiError, setApiError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isSpeechToTextEnabled, setIsSpeechToTextEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load chat history from local storage on component mount
  useEffect(() => {
    const storedMessages = localStorage.getItem('chat-history');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
        setMessagesLoaded(true);
      } catch (error) {
        console.error("Error parsing chat history from local storage:", error);
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi tải lịch sử trò chuyện",
          variant: "destructive",
        });
      }
    } else {
      setMessagesLoaded(true);
    }
  }, [toast]);

  // Save chat history to local storage whenever messages change
  useEffect(() => {
    if (messagesLoaded) {
      localStorage.setItem('chat-history', JSON.stringify(messages));
    }
  }, [messages, messagesLoaded]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Manual implementation of chat functionality
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simulate API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json() as ChatResponse;
      
      if (data.error) {
        setApiError(data.error);
      } else {
        setApiError(null);
        // Add assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content || "I'm sorry, I couldn't process your request."
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      setApiError("Failed to connect to the server.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const complete = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Simulate API call
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });
      
      const data = await response.json() as ChatResponse;
      
      if (data.error) {
        setApiError(data.error);
      } else {
        setApiError(null);
        // Add assistant response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content || "I'm sorry, I couldn't process your request."
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      setApiError("Failed to connect to the server.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    if (!user) {
      setIsAlertDialogOpen(true);
      return;
    }
    if (tokenBalance === 0) {
      toast({
        title: "Hết token",
        description: "Bạn đã hết token. Vui lòng nạp thêm token để tiếp tục sử dụng.",
      });
      return;
    }
    if (settings?.isStream) {
      e.preventDefault();
      complete(input);
      setInput('');
    } else {
      handleAISubmit(e);
    }
  };

  // Speech to text functionality
  const {
    startListening,
    stopListening,
    transcript,
    isListening,
    browserSupportsSpeechRecognition
  } = useSpeechToText();

  // Focus on input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="py-4">
            {messages.map((message) => (
              <div key={message.id} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-2/3 break-words ${message.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {apiError && (
              <div className="text-red-500 text-center">{apiError}</div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="py-4">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              placeholder="Nhập tin nhắn..."
              value={isSpeechToTextEnabled ? transcript : input}
              onChange={isSpeechToTextEnabled ? () => { } : handleInputChange}
              className="pr-12"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-2 flex items-center space-x-2">
              {browserSupportsSpeechRecognition && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (isSpeechToTextEnabled) {
                      stopListening();
                    } else {
                      startListening();
                    }
                    setIsSpeechToTextEnabled(!isSpeechToTextEnabled);
                  }}
                  disabled={isLoading}
                >
                  {isListening ? "Dừng" : "Nói"}
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Gửi
              </Button>
            </div>
          </form>
        </div>
      </div>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn cần đăng nhập</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn cần đăng nhập để sử dụng tính năng này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsAlertDialogOpen(false);
              toast({
                title: "Chuyển hướng",
                description: "Bạn sẽ được chuyển hướng đến trang đăng nhập.",
              });
              setTimeout(() => {
                window.location.href = "/auth";
              }, 500);
            }}>Đăng nhập</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Index;
