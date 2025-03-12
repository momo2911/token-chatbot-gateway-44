
import React, { useRef, useEffect } from 'react';
import { CpuIcon, User, Bot } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResponseDisplayProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

export function ResponseDisplay({ 
  messages, 
  isLoading = false,
  className 
}: ResponseDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <CpuIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Hỏi điều gì đó</h3>
          <p className="text-muted-foreground">
            Hãy tải lên hình ảnh hoặc đặt câu hỏi để bắt đầu
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex items-start",
                message.role === "user" ? "justify-end" : ""
              )}
            >
              <div 
                className={cn(
                  "max-w-[80%] flex",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div 
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.role === "user" 
                      ? "bg-accent text-white ml-3" 
                      : "bg-secondary mr-3"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                
                <div 
                  className={cn(
                    "rounded-xl p-4 glass-card",
                    message.role === "user" 
                      ? "rounded-tr-sm bg-accent text-white border-0" 
                      : "rounded-tl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div 
                    className={cn(
                      "text-xs mt-2",
                      message.role === "user" ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start">
              <div className="flex max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                  <Bot className="w-4 h-4" />
                </div>
                
                <div className="rounded-xl rounded-tl-sm p-4 glass-card">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
