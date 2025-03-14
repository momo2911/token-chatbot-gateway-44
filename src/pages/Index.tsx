
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Mic, MicOff, Image as ImageIcon, RotateCcw } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import { ImageUploader } from '@/components/ImageUploader';
import { sendChatMessage, sendCompletionRequest } from '@/api/chat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { getChatMessages, addChatMessage, updateChatTitle, ChatMessage } from '@/utils/chatService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface ChatResponse {
  error?: string;
  response?: string;
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const chatId = searchParams.get('chatId');
  const { toast } = useToast();
  const { user } = useUser();
  const { settings } = useSettings();
  const { tokenBalance } = useTokenBalance();
  const { createChatHistory, activeHistoryId, setActiveHistoryId } = useChatHistory();
  const [apiError, setApiError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isSpeechToTextEnabled, setIsSpeechToTextEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Load messages for the selected chat history
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId || !user) {
        setMessages([]);
        setMessagesLoaded(true);
        return;
      }

      try {
        setIsLoading(true);
        const chatMessages = await getChatMessages(chatId);
        
        setMessages(chatMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          imageUrl: msg.imageUrl
        })));
        
        setActiveHistoryId(chatId);
      } catch (error) {
        console.error("Error loading chat messages:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải tin nhắn trò chuyện",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setMessagesLoaded(true);
      }
    };

    if (user) {
      loadMessages();
    }
  }, [chatId, user, toast, setActiveHistoryId]);

  // Create a new chat if none is selected
  useEffect(() => {
    const createNewChatIfNeeded = async () => {
      if (user && !chatId && messagesLoaded) {
        const newChatId = await createChatHistory();
        if (newChatId) {
          navigate(`/?chatId=${newChatId}`);
        }
      }
    };
    
    createNewChatIfNeeded();
  }, [user, chatId, messagesLoaded, createChatHistory, navigate]);

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
    if (!input.trim() && !uploadedImage) return;
    if (!chatId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      imageUrl: uploadedImage || undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);
    
    try {
      // Save the user message to the database
      await addChatMessage(chatId, {
        role: 'user',
        content: input,
        imageUrl: uploadedImage
      });
      
      // Update the chat title if this is the first message
      if (messages.length === 0) {
        await updateChatTitle(chatId, input);
      }
      
      const data = await sendChatMessage({
        userId: user?.uid || 'anonymous',
        prompt: input, 
        imageUrl: uploadedImage || undefined 
      });
      
      if (data.error) {
        setApiError(data.error);
      } else {
        setApiError(null);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || "I'm sorry, I couldn't process your request."
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Save the assistant message to the database
        await addChatMessage(chatId, {
          role: 'assistant',
          content: data.response || "I'm sorry, I couldn't process your request."
        });
      }
    } catch (error) {
      setApiError("Failed to connect to the server.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const complete = async (text: string) => {
    if (!chatId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      imageUrl: uploadedImage || undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setUploadedImage(null);
    setIsLoading(true);
    
    try {
      // Save the user message to the database
      await addChatMessage(chatId, {
        role: 'user',
        content: text,
        imageUrl: uploadedImage
      });
      
      // Update the chat title if this is the first message
      if (messages.length === 0) {
        await updateChatTitle(chatId, text);
      }
      
      const data = await sendCompletionRequest({ 
        prompt: text, 
        imageUrl: uploadedImage || undefined 
      });
      
      if (data.error) {
        setApiError(data.error);
      } else {
        setApiError(null);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || "I'm sorry, I couldn't process your request."
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Save the assistant message to the database
        await addChatMessage(chatId, {
          role: 'assistant',
          content: data.response || "I'm sorry, I couldn't process your request."
        });
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
    
    if (settings?.isStream) {
      e.preventDefault();
      complete(input);
      setInput('');
    } else {
      handleAISubmit(e);
    }
  };

  // Handle image upload
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setIsImageUploaderOpen(false);
    toast({
      title: "Tải lên thành công",
      description: "Hình ảnh đã được tải lên và sẵn sàng để gửi.",
    });
  };

  // Handle starting a new chat
  const handleNewChat = async () => {
    const newChatId = await createChatHistory();
    if (newChatId) {
      navigate(`/?chatId=${newChatId}`);
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
  }, [chatId]);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="border-b pb-2 mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Cuộc trò chuyện</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleNewChat}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Cuộc trò chuyện mới</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4">
          <div className="py-4 max-w-3xl mx-auto space-y-6">
            {isLoading && messages.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center mt-10 space-y-3 h-">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  Chào mừng đến với trợ lý AI
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên của bạn.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`relative px-4 py-3 rounded-lg max-w-[80%] shadow-sm 
                      ${message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    {message.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Uploaded" 
                          className="max-w-full max-h-64 rounded-md object-contain"
                        />
                      </div>
                    )}
                    <div 
                      className={`absolute w-3 h-3 bottom-0 
                        ${message.role === 'user' 
                          ? 'right-0 translate-x-1/2 bg-primary' 
                          : 'left-0 -translate-x-1/2 bg-muted'
                        }`}
                      style={{
                        clipPath: message.role === 'user' 
                          ? 'polygon(0 0, 100% 0, 100% 100%)' 
                          : 'polygon(0 0, 100% 0, 0 100%)'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-center">
                {apiError}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t py-4 px-4">
          <div className="max-w-3xl mx-auto">
            {uploadedImage && (
              <div className="mb-2 relative">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="h-20 rounded-md object-contain" 
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={() => setUploadedImage(null)}
                >
                  <span className="sr-only">Xóa ảnh</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </Button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <Input
                ref={inputRef}
                placeholder="Nhập tin nhắn..."
                value={isSpeechToTextEnabled ? transcript : input}
                onChange={isSpeechToTextEnabled ? () => {} : handleInputChange}
                className="pr-24 py-6 rounded-full shadow-sm"
                disabled={isLoading}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsImageUploaderOpen(true)}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                {browserSupportsSpeechRecognition && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (isSpeechToTextEnabled) {
                        stopListening();
                        setInput(transcript);
                      } else {
                        startListening();
                      }
                      setIsSpeechToTextEnabled(!isSpeechToTextEnabled);
                    }}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                )}
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={isLoading || (!input.trim() && !uploadedImage)}
                  className="rounded-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
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

      <ImageUploader 
        isOpen={isImageUploaderOpen} 
        onClose={() => setIsImageUploaderOpen(false)}
        onUpload={handleImageUpload}
      />
    </Layout>
  );
};

export default Index;
