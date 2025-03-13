
import React from 'react';
import { ImageUploadModal } from './ImageUploadModal';

interface ImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

export function ImageUploader({ isOpen, onClose, onUpload }: ImageUploaderProps) {
  return (
    <ImageUploadModal
      isOpen={isOpen}
      onClose={onClose}
      onUpload={onUpload}
    />
  );
}
