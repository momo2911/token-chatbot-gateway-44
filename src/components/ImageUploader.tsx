
import React, { useState, useRef } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { extractTextFromImage } from '@/utils/ocr';
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onTextExtracted: (text: string) => void;
  className?: string;
}

export function ImageUploader({ onTextExtracted, className }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi tải lên",
        description: "Vui lòng chọn một tệp hình ảnh hợp lệ",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi tải lên",
        description: "Kích thước hình ảnh không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result as string;
      setImage(imageDataUrl);
      setIsUploading(false);
      
      // Process image for OCR
      try {
        setIsProcessing(true);
        const extractedText = await extractTextFromImage(imageDataUrl);
        if (extractedText && extractedText.trim()) {
          onTextExtracted(extractedText);
          toast({
            title: "Trích xuất thành công",
            description: "Đã trích xuất văn bản từ hình ảnh",
          });
        } else {
          toast({
            title: "Không tìm thấy văn bản",
            description: "Không thể trích xuất văn bản từ hình ảnh này",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi xử lý",
          description: "Không thể xử lý hình ảnh. Vui lòng thử lại.",
          variant: "destructive",
        });
        console.error("OCR error:", error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      
      {!image ? (
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-4 transition-all-200 hover:bg-accent/5 hover:border-accent"
        >
          <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Đang tải lên..." : "Tải lên hình ảnh có văn bản"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG hoặc GIF (tối đa 5MB)</p>
        </button>
      ) : (
        <div className="relative rounded-lg overflow-hidden glass-card p-1">
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-auto max-h-64 object-contain rounded"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-all-200"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          
          {isProcessing && (
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center">
              <div className="glass p-4 rounded-lg shadow text-center">
                <div className="animate-pulse-subtle">
                  <Image className="h-6 w-6 mx-auto mb-2" />
                </div>
                <p className="text-sm font-medium">Đang trích xuất văn bản...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
