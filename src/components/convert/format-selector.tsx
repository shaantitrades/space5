'use client';

import { useEffect, useState } from 'react';

interface FormatSelectorProps {
  inputFile: File | null;
  onFormatSelect: (format: string) => void;
  disabled?: boolean;
}

const FORMAT_GROUPS = {
  image: {
    label: 'Images',
    formats: ['PNG', 'JPG', 'WEBP', 'GIF', 'SVG', 'BMP', 'TIFF'],
  },
  pdf: {
    label: 'PDF',
    formats: ['PDF'],
  },
  document: {
    label: 'Documents',
    formats: ['DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT'],
  },
  video: {
    label: 'Videos',
    formats: ['MP4', 'AVI', 'MOV', 'WEBM', 'MKV'],
  },
  audio: {
    label: 'Audio',
    formats: ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG', 'M4A'],
  },
};

export function FormatSelector({ inputFile, onFormatSelect, disabled }: FormatSelectorProps) {
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);

  useEffect(() => {
    if (!inputFile) {
      setAvailableFormats([]);
      return;
    }

    // Déterminer les formats disponibles selon le type de fichier d'entrée
    const extension = inputFile.name.split('.').pop()?.toLowerCase();
    const mimeType = inputFile.type;

    const formats: string[] = [];

    if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'tiff'].includes(extension || '')) {
      formats.push(...FORMAT_GROUPS.image.formats);
    }

    if (mimeType === 'application/pdf' || extension === 'pdf') {
      formats.push(...FORMAT_GROUPS.pdf.formats, ...FORMAT_GROUPS.image.formats, ...FORMAT_GROUPS.document.formats);
    }

    if (mimeType.includes('wordprocessing') || mimeType.includes('spreadsheet') || mimeType.includes('presentation') || 
        ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
      formats.push(...FORMAT_GROUPS.document.formats, ...FORMAT_GROUPS.pdf.formats);
    }

    if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(extension || '')) {
      formats.push(...FORMAT_GROUPS.video.formats);
    }

    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(extension || '')) {
      formats.push(...FORMAT_GROUPS.audio.formats);
    }

    // Dédupliquer
    setAvailableFormats([...new Set(formats)]);
  }, [inputFile]);

  if (!inputFile) {
    return (
      <div className="p-4 border rounded-lg bg-muted text-muted-foreground text-sm text-center">
        Please upload a file first
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {availableFormats.map((format) => (
        <button
          key={format}
          onClick={() => onFormatSelect(format.toLowerCase())}
          disabled={disabled}
          className="p-3 border rounded-lg hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {format}
        </button>
      ))}
    </div>
  );
}
