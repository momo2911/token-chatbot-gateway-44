import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Mic, MicOff, Image as ImageIcon } from 'lucide-react';
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

// Define interfaces to fix the type errors
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface ChatResponse {
  error?: string;
  content?: string;
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
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
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
    if (!input.trim() && !uploadedImage) return;
    
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
      const data = await sendChatMessage({
        userId: user?.uid|| 'anonymous',
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
      }
    } catch (error) {
      setApiError("Failed to connect to the server.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const complete = async (text: string) => {
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
    // if (tokenBalance === 0) {
    //   toast({
    //     title: "Hết token",
    //     description: "Bạn đã hết token. Vui lòng nạp thêm token để tiếp tục sử dụng.",
    //   });
    //   return;
    // }
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
        <div className="flex-1 overflow-y-auto px-4">
          <div className="py-4 max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
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
