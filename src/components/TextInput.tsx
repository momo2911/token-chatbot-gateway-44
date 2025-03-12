
import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TextInputProps {
  onSend: (text: string) => void;
  initialText?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TextInput({ 
  onSend, 
  initialText = '', 
  className,
  placeholder = "Nhập tin nhắn của bạn hoặc tải lên hình ảnh...",
  disabled = false
}: TextInputProps) {
  const [text, setText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  // Auto resize textarea as content grows
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "relative glass-card transition-all-300",
        isFocused ? "shadow-glass-md ring-1 ring-accent/40" : "",
        className
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
        disabled={disabled || !text.trim()}
        className={cn(
          "absolute right-3 bottom-3 p-2 rounded-full transition-all-200",
          text.trim() 
            ? "bg-accent text-white hover:bg-accent/90" 
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        <SendHorizontal size={18} />
      </button>
    </form>
  );
}
