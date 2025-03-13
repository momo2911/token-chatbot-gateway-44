
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X, FileImage } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

export function ImageUploadModal({ isOpen, onClose, onUpload }: ImageUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.match('image.*')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chỉ tải lên tập tin hình ảnh.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước tập tin không được vượt quá 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Read the file and set as preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (previewUrl) {
      onUpload(previewUrl);
      resetForm();
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tải lên hình ảnh</DialogTitle>
        </DialogHeader>
        
        <div 
          className={`
            mt-4 p-6 border-2 border-dashed rounded-lg 
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border'} 
            transition-colors duration-200 flex flex-col items-center justify-center
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="relative w-full">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-64 mx-auto object-contain rounded-md" 
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 h-8 w-8 rounded-full shadow-sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-muted rounded-full">
                <FileImage className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mb-2 text-sm font-medium">Kéo và thả hình ảnh vào đây hoặc</p>
              <Button 
                variant="secondary" 
                onClick={handleUploadClick}
                disabled={isLoading}
              >
                {isLoading ? 'Đang tải...' : 'Chọn tập tin'}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Hỗ trợ PNG, JPG, GIF (tối đa 5MB)
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!previewUrl || isLoading}
          >
            {isLoading ? 'Đang tải...' : 'Sử dụng hình ảnh'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
