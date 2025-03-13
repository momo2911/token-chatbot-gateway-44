
import React, { useState } from 'react';
import { SendHorizontal, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { isValidChatMessage } from '@/utils/validation';

interface TextInputProps {
  onSend: (text: string) => void;
  initialText?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function TextInput({ 
  onSend, 
  initialText = '', 
  className,
  placeholder = "Nhập tin nhắn của bạn hoặc tải lên hình ảnh...",
  disabled = false,
  maxLength = 1000
}: TextInputProps) {
  const [text, setText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the message
    if (!isValidChatMessage(text, maxLength)) {
      if (!text.trim()) {
        setError("Tin nhắn không được để trống");
      } else if (text.length > maxLength) {
        setError(`Tin nhắn không được vượt quá ${maxLength} ký tự`);
      }
      return;
    }
    
    onSend(text.trim());
    setText('');
    setError(null);
  };

  // Auto resize textarea as content grows
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError(null);
    }
    
    // Show error if exceeding max length
    if (value.length > maxLength) {
      setError(`Tin nhắn không được vượt quá ${maxLength} ký tự`);
    } else if (error && value.length <= maxLength && value.trim()) {
      setError(null);
    }
    
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const charactersLeft = maxLength - text.length;
  const isOverLimit = charactersLeft < 0;

  return (
    <div className={className}>
      <form 
        onSubmit={handleSubmit} 
        className={cn(
          "relative glass-card transition-all-300",
          isFocused ? "shadow-glass-md ring-1 ring-accent/40" : "",
          error ? "ring-1 ring-destructive/60" : ""
        )}
      >
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full resize-none py-3 pl-4 pr-12 outline-none bg-transparent rounded-lg min-h-[60px] max-h-[200px] overflow-y-auto text-base"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button 
          type="submit"
          disabled={disabled || !text.trim() || isOverLimit}
          className={cn(
            "absolute right-3 bottom-3 p-2 rounded-full transition-all-200",
            text.trim() && !isOverLimit
              ? "bg-accent text-white hover:bg-accent/90" 
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <SendHorizontal size={18} />
        </button>
      </form>
      
      <div className="mt-1.5 flex justify-between items-center text-xs">
        {error ? (
          <p className="text-destructive flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </p>
        ) : (
          <span className="opacity-0">x</span> // Placeholder to maintain layout
        )}
        
        <span className={cn(
          "text-muted-foreground",
          charactersLeft < 100 && "text-amber-600",
          isOverLimit && "text-destructive"
        )}>
          {charactersLeft} ký tự còn lại
        </span>
      </div>
    </div>
  );
}
