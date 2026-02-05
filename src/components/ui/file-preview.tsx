'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Video, Music, File, X } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  showMetadata?: boolean;
}

export function FilePreview({ file, onRemove, showMetadata = true }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    dimensions?: { width: number; height: number };
    duration?: number;
    pages?: number;
  }>({});

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          setMetadata({ dimensions: { width: img.width, height: img.height } });
        };
        img.src = reader.result as string;
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // Pour PDF, afficher une icône pour l'instant
      // Dans une version complète, vous pourriez utiliser pdf.js pour générer une miniature
      setPreview(null);
    }

    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [file]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  const Icon = getFileIcon();
  const fileSize = formatFileSize(file.size);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-center px-4">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs mt-1">{fileSize}</p>
          </div>
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Metadata */}
      {showMetadata && (
        <div className="mt-2 space-y-1">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{fileSize}</span>
            {metadata.dimensions && (
              <>
                <span>•</span>
                <span>{metadata.dimensions.width} × {metadata.dimensions.height}</span>
              </>
            )}
            {metadata.pages && (
              <>
                <span>•</span>
                <span>{metadata.pages} page{metadata.pages > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
