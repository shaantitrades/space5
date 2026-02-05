'use client';

import { useState, Suspense, lazy } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Zap,
  Droplets,
  Scissors,
  Maximize2,
  Download,
  Upload,
  Trash2,
  Star,
  Cloud,
  Link2,
  Edit,
} from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { FileUploadSkeleton } from '@/components/ui/file-upload-skeleton';

// Lazy load ImageEditor pour optimiser le bundle
const ImageEditor = lazy(() => 
  import('@/components/editors/image-editor').then(mod => ({ default: mod.ImageEditor }))
);

type ImageTool = 'convert' | 'optimize' | 'resize' | 'filters' | 'watermark' | 'batch' | 'favicon';

export default function ImagesPage() {
  const [selectedTool, setSelectedTool] = useState<ImageTool>('convert');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImageFormat, setSelectedImageFormat] = useState<string>('');
  const [selectedFaviconFormat, setSelectedFaviconFormat] = useState<string>('ICO');
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const tools = [
    {
      id: 'convert' as ImageTool,
      name: 'Conversion',
      description: '20+ formats (JPG, PNG, WebP, AVIF, GIF, etc.)',
      icon: ImageIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'optimize' as ImageTool,
      name: 'Optimisation',
      description: 'Compression intelligente, WebP, AVIF',
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'resize' as ImageTool,
      name: 'Redimensionner',
      description: 'Resize, crop, rotate, flip',
      icon: Maximize2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'filters' as ImageTool,
      name: 'Filtres',
      description: 'Grayscale, sepia, blur, sharpen',
      icon: Sparkles,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'watermark' as ImageTool,
      name: 'Filigrane',
      description: 'Ajouter texte ou logo',
      icon: Droplets,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'batch' as ImageTool,
      name: 'Traitement par lot',
      description: '100+ images simultanément',
      icon: Scissors,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'favicon' as ImageTool,
      name: 'Générateur Favicon',
      description: 'Créer favicons (16x16, 32x32, 192x192, etc.)',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('tool', selectedTool);
      
      // Ajouter le format sélectionné pour la conversion
      if (selectedTool === 'convert' && selectedImageFormat) {
        formData.append('outputFormat', selectedImageFormat.toLowerCase());
      }
      // Ajouter le format sélectionné pour le favicon
      if (selectedTool === 'favicon' && selectedFaviconFormat) {
        formData.append('outputFormat', selectedFaviconFormat.toLowerCase());
      }

      const response = await fetch('/api/images/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Échec du traitement');

      const blob = await response.blob();
      
      // Pour les outils qui génèrent des images, ouvrir l'éditeur
      // Pour le favicon (ZIP) ou batch, télécharger directement
      if (selectedTool === 'favicon' || selectedTool === 'batch') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `result-${selectedTool}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Pour les autres outils (convert, optimize, etc.), ouvrir l'éditeur
        const processedFile = new File([blob], files[0]?.name || `result.${selectedImageFormat.toLowerCase() || 'png'}`, {
          type: blob.type || 'image/png',
        });
        setProcessedFile(processedFile);
        setShowEditor(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentTool = tools.find((t) => t.id === selectedTool);

  // Gérer la fermeture de l'éditeur
  const handleEditorClose = () => {
    setShowEditor(false);
    setProcessedFile(null);
  };

  // Gérer la sauvegarde depuis l'éditeur
  const handleEditorSave = (editedFile: File) => {
    // Sauvegarder le fichier édité en mémoire (rester dans l'éditeur)
    setProcessedFile(editedFile);
  };

  // Afficher l'éditeur si nécessaire
  if (showEditor && processedFile) {
    return (
      <Suspense fallback={<FileUploadSkeleton />}>
        <ImageEditor
          file={processedFile}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Bouton retour */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Images & Logos - Studio Professionnel
          </h1>
          <p className="text-xl text-muted-foreground">
            Conversion, optimisation et édition d'images en un clic
          </p>
        </div>

        {/* Sélection de l'outil */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                }`}
              >
                <div className={`${tool.bgColor} ${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </button>
            );
          })}
        </div>

        {/* Zone de traitement */}
        <div className="bg-card rounded-xl border-2 border-border p-8 shadow-lg">
          {currentTool && (
            <>
              <div className="flex items-center mb-6">
                <div className={`${currentTool.bgColor} ${currentTool.color} w-16 h-16 rounded-lg flex items-center justify-center mr-4`}>
                  <currentTool.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{currentTool.name}</h2>
                  <p className="text-muted-foreground">{currentTool.description}</p>
                </div>
              </div>

              {/* Zone de dépôt */}
              <div className="mb-6">
                {/* Zone principale drag-and-drop */}
                <label className="block w-full mb-4">
                  <div className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-xl font-bold mb-4">
                      Déposez votre fichier ici
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload-main-images"
                    />
                    <label
                      htmlFor="file-upload-main-images"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      📁 Parcourir fichiers
                    </label>
                    <p className="text-xs text-muted-foreground mt-4">
                      JPG, PNG, WebP, GIF, TIFF, BMP, SVG acceptés
                    </p>
                  </div>
                </label>

                {/* Cartes d'importation cloud */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Google Drive */}
                  <button
                    onClick={() => {
                      // TODO: Implémenter l'intégration Google Drive
                      console.log('Importer depuis Google Drive');
                    }}
                    className="p-6 bg-muted/50 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 via-blue-500 to-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Importer depuis Google Drive</h3>
                    <p className="text-sm text-muted-foreground">Cliquez pour sélectionner des fichiers</p>
                  </button>

                  {/* Dropbox */}
                  <button
                    onClick={() => {
                      // TODO: Implémenter l'intégration Dropbox
                      console.log('Importer depuis Dropbox');
                    }}
                    className="p-6 bg-muted/50 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500 mb-4 group-hover:scale-110 transition-transform">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Importer depuis Dropbox</h3>
                    <p className="text-sm text-muted-foreground">Cliquez pour sélectionner des fichiers</p>
                  </button>

                  {/* OneDrive */}
                  <button
                    onClick={() => {
                      // TODO: Implémenter l'intégration OneDrive
                      console.log('Importer depuis OneDrive');
                    }}
                    className="p-6 bg-muted/50 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      <Cloud className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Importer depuis OneDrive</h3>
                    <p className="text-sm text-muted-foreground">Cliquez pour sélectionner des fichiers</p>
                  </button>

                  {/* Adresse web (URL) */}
                  <button
                    onClick={() => {
                      // TODO: Implémenter l'import depuis URL
                      const url = prompt('Entrez l\'URL de l\'image :');
                      if (url) {
                        console.log('Importer depuis URL:', url);
                      }
                    }}
                    className="p-6 bg-muted/50 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500 mb-4 group-hover:scale-110 transition-transform">
                      <Link2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Adresse web (URL)</h3>
                    <p className="text-sm text-muted-foreground">Cliquez pour sélectionner des fichiers</p>
                  </button>

                </div>
              </div>

              {/* Liste des fichiers */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Images sélectionnées ({files.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setProcessedFile(file);
                              setShowEditor(true);
                            }}
                            className="bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
                            title="Éditer l'image"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options spécifiques */}
              {selectedTool === 'convert' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Format de sortie</h3>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                    {['JPG', 'PNG', 'WebP', 'AVIF', 'GIF', 'TIFF', 'ICO'].map((fmt) => (
                      <button 
                        key={fmt}
                        onClick={() => setSelectedImageFormat(fmt)}
                        className={`px-4 py-3 border-2 rounded-lg transition-colors font-medium ${
                          selectedImageFormat === fmt
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border hover:border-primary hover:bg-primary/10'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTool === 'resize' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Dimensions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Largeur" className="px-4 py-3 border-2 border-border rounded-lg" />
                    <input type="number" placeholder="Hauteur" className="px-4 py-3 border-2 border-border rounded-lg" />
                  </div>
                </div>
              )}

              {selectedTool === 'filters' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Filtres</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Grayscale', 'Sepia', 'Blur', 'Sharpen', 'Negative', 'Vintage'].map((filter) => (
                      <button key={filter} className="px-4 py-3 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/10 transition-colors font-medium">
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTool === 'watermark' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Texte du filigrane</h3>
                  <input type="text" placeholder="OMNIVERSA" className="w-full px-4 py-3 border-2 border-border rounded-lg" />
                </div>
              )}

              {selectedTool === 'favicon' && files.length > 0 && (
                <>
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-3">Format de sortie</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {['ICO', 'PNG', 'JPG', 'SVG', 'BMP', 'GIF', 'EPS', 'TGA', 'TIFF', 'WebP', 'WBMP'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setSelectedFaviconFormat(fmt)}
                          className={`px-4 py-3 border-2 rounded-lg transition-colors font-medium ${
                            selectedFaviconFormat === fmt
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-border hover:border-primary hover:bg-primary/10'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Package Favicon Complet
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>✅ favicon-16x16.{selectedFaviconFormat.toLowerCase()}</p>
                      <p>✅ favicon-32x32.{selectedFaviconFormat.toLowerCase()}</p>
                      <p>✅ favicon-48x48.{selectedFaviconFormat.toLowerCase()}</p>
                      <p>✅ apple-touch-icon.{selectedFaviconFormat.toLowerCase()} (180x180)</p>
                      <p>✅ android-chrome-192x192.{selectedFaviconFormat.toLowerCase()}</p>
                      <p>✅ android-chrome-512x512.{selectedFaviconFormat.toLowerCase()}</p>
                    </div>
                    <p className="text-xs text-primary font-medium mt-3">
                      📦 Téléchargement en ZIP avec toutes les tailles
                    </p>
                  </div>
                </>
              )}

              {/* Bouton de traitement */}
              <button
                onClick={handleProcess}
                disabled={files.length === 0 || isProcessing}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2 ${
                  files.length === 0 || isProcessing
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Traiter et télécharger</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">20+</div>
            <p className="text-sm text-muted-foreground">Formats supportés</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <p className="text-sm text-muted-foreground">Images par lot</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">90%</div>
            <p className="text-sm text-muted-foreground">Compression moyenne</p>
          </div>
        </div>
      </div>
    </div>
  );
}
