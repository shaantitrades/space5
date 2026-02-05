'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Crop,
  RotateCw,
  Zap,
  Type,
  Download,
  Save,
  X,
  Undo,
  Redo,
  Minus,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

interface ImageEditorProps {
  file: File;
  onSave: (editedFile: File) => void;
  onClose: () => void;
}

type Filter = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast';

export function ImageEditor({ file, onSave, onClose }: ImageEditorProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [filters, setFilters] = useState<Record<Filter, number>>({
    none: 0,
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 100,
    contrast: 100,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        canvas.width = img.width;
        canvas.height = img.height;
        drawImage();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, filters, rotation]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Appliquer la rotation
    if (rotation !== 0) {
      ctx.save();
      const rad = (rotation * Math.PI) / 180;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate(rad);
      ctx.translate(-centerX, -centerY);
    }

    // Appliquer les filtres
    ctx.filter = buildFilterString();

    ctx.drawImage(img, 0, 0);
    if (rotation !== 0) {
      ctx.restore();
    }
  };

  const buildFilterString = (): string => {
    const filterParts: string[] = [];
    if (filters.grayscale > 0) filterParts.push(`grayscale(${filters.grayscale}%)`);
    if (filters.sepia > 0) filterParts.push(`sepia(${filters.sepia}%)`);
    if (filters.blur > 0) filterParts.push(`blur(${filters.blur}px)`);
    if (filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`);
    if (filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`);
    return filterParts.join(' ');
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const editedFile = new File([blob], file.name, { type: file.type });
        onSave(editedFile);
      }
    }, file.type);
  };

  const applyFilter = (filterType: Filter, value: number) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-background flex flex-col">
      {/* Barre d'outils supérieure */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Éditeur d'Image</h2>
          <span className="text-sm text-muted-foreground ml-4">
            {file.name}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.toBlob((blob) => {
                  if (blob) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = file.name;
                    link.click();
                  }
                });
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Barre latérale d'outils */}
        <div className="w-64 bg-card border-r border-border p-4 space-y-6 overflow-y-auto">
          {/* Rotation */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              Rotation
            </h3>
            <button
              onClick={handleRotate}
              className="w-full px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Pivoter de 90°
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Rotation actuelle: {rotation}°
            </p>
          </div>

          {/* Filtres */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Filtres
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Luminosité</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => applyFilter('brightness', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.brightness}%</span>
              </div>

              <div>
                <label className="text-sm mb-2 block">Contraste</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => applyFilter('contrast', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.contrast}%</span>
              </div>

              <div>
                <label className="text-sm mb-2 block">Niveaux de gris</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => applyFilter('grayscale', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.grayscale}%</span>
              </div>

              <div>
                <label className="text-sm mb-2 block">Sépia</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.sepia}
                  onChange={(e) => applyFilter('sepia', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.sepia}%</span>
              </div>

              <div>
                <label className="text-sm mb-2 block">Flou</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.blur}
                  onChange={(e) => applyFilter('blur', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.blur}px</span>
              </div>
            </div>
          </div>

          {/* Presets de filtres */}
          <div>
            <h3 className="font-semibold mb-3">Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setFilters({
                    none: 0,
                    grayscale: 0,
                    sepia: 0,
                    blur: 0,
                    brightness: 100,
                    contrast: 100,
                  });
                  setRotation(0);
                }}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-muted"
              >
                Normal
              </button>
              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    grayscale: 100,
                  });
                }}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-muted"
              >
                Noir & Blanc
              </button>
              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    sepia: 100,
                  });
                }}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-muted"
              >
                Sépia
              </button>
              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    brightness: 120,
                    contrast: 110,
                  });
                }}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-muted"
              >
                Vif
              </button>
            </div>
          </div>
        </div>

        {/* Zone d'édition */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="bg-white shadow-lg max-w-full max-h-full"
              style={{ display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
