'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Video,
  Music,
  Film,
  Scissors,
  Minimize2,
  Volume2,
  Download,
  Upload,
  Trash2,
  Cloud,
  Link2,
  X,
  CheckCircle2,
} from 'lucide-react';

type MediaTool = 'video-convert' | 'audio-convert' | 'extract-audio' | 'trim' | 'compress' | 'merge';

export default function MediaPage() {
  const searchParams = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<MediaTool>('video-convert');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<string>('');
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<string>('');
  const [processedFile, setProcessedFile] = useState<{ blob: Blob; filename: string } | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const tools = [
    {
      id: 'video-convert' as MediaTool,
      name: 'Conversion Vidéo',
      description: 'MP4, AVI, MOV, WebM, MKV, FLV',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      accept: 'video/*',
    },
    {
      id: 'audio-convert' as MediaTool,
      name: 'Conversion Audio',
      description: 'MP3, WAV, FLAC, AAC, OGG',
      icon: Music,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      accept: 'audio/*',
    },
    {
      id: 'extract-audio' as MediaTool,
      name: 'Extraire Audio',
      description: 'Extraire l\'audio d\'une vidéo',
      icon: Volume2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      accept: 'video/*',
    },
    {
      id: 'trim' as MediaTool,
      name: 'Découper',
      description: 'Couper vidéo/audio',
      icon: Scissors,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      accept: 'video/*,audio/*',
    },
    {
      id: 'compress' as MediaTool,
      name: 'Compresser',
      description: 'Réduire la taille',
      icon: Minimize2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      accept: 'video/*,audio/*',
    },
    {
      id: 'merge' as MediaTool,
      name: 'Fusionner',
      description: 'Combiner plusieurs fichiers',
      icon: Film,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      accept: 'video/*,audio/*',
    },
  ];

  /** Zone de dépôt : cible du défilement automatique au choix d'un outil */
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  /** Évite de défiler en boucle si l'effet ci-dessous se relance */
  const lastHandledToolRef = useRef<string | null>(null);

  /** Fait descendre la page jusqu'à la zone de traitement */
  const scrollToUploadZone = () => {
    // Léger délai : le panneau de l'outil doit être rendu avant de défiler
    setTimeout(() => {
      uploadZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Détecte le paramètre ?tool= dans l'URL et sélectionne l'outil correspondant
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (!toolParam || !tools.some((t) => t.id === toolParam)) return;

    setSelectedTool(toolParam as MediaTool);

    // Ne défiler qu'une seule fois par valeur de ?tool= :
    // cela évite tout défilement répété si l'effet se relance.
    if (lastHandledToolRef.current === toolParam) return;
    lastHandledToolRef.current = toolParam;

    // Arriver via un lien direct (ex. /media?tool=video-convert) doit aussi
    // amener l'utilisateur jusqu'à la zone de traitement.
    scrollToUploadZone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setProcessedFile(null); // Réinitialiser le fichier traité lors de la sélection de nouveaux fichiers
      setDownloadSuccess(false); // Réinitialiser le statut de téléchargement
    }
  };

  // Fonction pour déclencher la sélection de fichiers
  const triggerFileSelection = () => {
    const input = document.getElementById('file-upload-main-media') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  // Fonction pour gérer l'import depuis le cloud (temporairement utilise la sélection locale)
  const handleCloudImport = (provider: 'google-drive' | 'dropbox' | 'onedrive') => {
    // Pour l'instant, utiliser la sélection de fichiers locale comme fallback
    // TODO: Implémenter l'intégration réelle avec les APIs cloud (Google Picker API, Dropbox Chooser, Microsoft Graph API)
    console.info(`Import cloud « ${provider} » non implémenté : sélection locale utilisée à la place.`);
    // Déclencher la sélection de fichiers locale comme alternative temporaire
    triggerFileSelection();
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setProcessedFile(null); // Réinitialiser le fichier traité lors de la suppression d'un fichier
    setDownloadSuccess(false); // Réinitialiser le statut de téléchargement
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    // Vérifier que le format est sélectionné pour les conversions
    if (selectedTool === 'video-convert' && !selectedVideoFormat) {
      toast.error('Format manquant', {
        description: 'Veuillez sélectionner un format vidéo de sortie'
      });
      return;
    }
    if (selectedTool === 'audio-convert' && !selectedAudioFormat) {
      toast.error('Format manquant', {
        description: 'Veuillez sélectionner un format audio de sortie'
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessedFile(null); // Réinitialiser le fichier traité
    setDownloadSuccess(false); // Réinitialiser le statut de téléchargement

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('tool', selectedTool);
      
      // Ajouter le format sélectionné
      if (selectedTool === 'video-convert' && selectedVideoFormat) {
        formData.append('outputFormat', selectedVideoFormat.toLowerCase());
      }
      if (selectedTool === 'audio-convert' && selectedAudioFormat) {
        formData.append('outputFormat', selectedAudioFormat.toLowerCase());
      }

      const response = await fetch('/api/media/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Échec du traitement');

      const blob = await response.blob();
      const extension = selectedTool === 'audio-convert' && selectedAudioFormat
        ? selectedAudioFormat.toLowerCase()
        : selectedTool === 'video-convert' && selectedVideoFormat
        ? selectedVideoFormat.toLowerCase()
        : selectedTool.includes('audio') ? 'mp3' : 'mp4';
      const filename = `result-${selectedTool}.${extension}`;
      
      // Stocker le fichier traité au lieu de le télécharger immédiatement
      setProcessedFile({ blob, filename });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du traitement', {
        description: 'Impossible de traiter le fichier. Vérifiez le format et réessayez.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFile) {
      console.log('Aucun fichier traité disponible');
      return;
    }
    
    console.log('Début du téléchargement:', processedFile.filename);
    
    const url = URL.createObjectURL(processedFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = processedFile.filename;
    a.click();
    URL.revokeObjectURL(url);
    
    // Marquer que le téléchargement a réussi
    console.log('Téléchargement déclenché, activation du message de succès');
    setDownloadSuccess(true);
    
    // Afficher le message de succès pendant 10 secondes
    setTimeout(() => {
      console.log('Masquage du message de succès après 10 secondes');
      setDownloadSuccess(false);
    }, 10000);
  };

  const currentTool = tools.find((t) => t.id === selectedTool);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-7xl">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Vidéo & Audio - Studio Multimédia
          </h1>
          <p className="text-xl text-muted-foreground">
            Conversion, découpage et compression vidéo/audio professionnels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id);
                  setProcessedFile(null); // Réinitialiser le fichier traité lors du changement d'outil
                  setDownloadSuccess(false); // Réinitialiser le statut de téléchargement
                  scrollToUploadZone();
                }}
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

              <div className="mb-6">
                {/* Zone principale drag-and-drop */}
                <label className="block w-full mb-4">
                  <div
                    ref={uploadZoneRef}
                    className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-xl font-bold mb-4">
                      Déposez votre fichier ici
                    </p>
                    <input
                      type="file"
                      multiple={selectedTool === 'merge'}
                      accept={currentTool.accept}
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload-main-media"
                    />
                    <label
                      htmlFor="file-upload-main-media"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      📁 Parcourir fichiers
                    </label>
                    <p className="text-xs text-muted-foreground mt-4">
                      {currentTool.accept === 'video/*' && 'Vidéos acceptées'}
                      {currentTool.accept === 'audio/*' && 'Fichiers audio acceptés'}
                      {currentTool.accept === 'video/*,audio/*' && 'Vidéos et audio acceptés'}
                    </p>
                  </div>
                </label>

                {/* Cartes d'importation cloud */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Google Drive */}
                  <button
                    onClick={() => handleCloudImport('google-drive')}
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
                    onClick={() => handleCloudImport('dropbox')}
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
                    onClick={() => handleCloudImport('onedrive')}
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
                      const url = prompt('Entrez l\'URL du fichier vidéo/audio :');
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

              {files.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Fichiers sélectionnés ({files.length})</h3>
                    {processedFile && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        Fichier traité disponible
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg border-2 transition-all" style={{
                        borderColor: processedFile && downloadSuccess ? 'rgb(34, 197, 94)' : 'transparent'
                      }}>
                        <div className="flex items-center space-x-3 flex-1">
                          {file.type.startsWith('video') ? (
                            <Video className="w-5 h-5 text-primary" />
                          ) : (
                            <Music className="w-5 h-5 text-primary" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{file.name}</p>
                              {processedFile && downloadSuccess && (
                                <span className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded-full flex items-center space-x-1">
                                  <Download className="w-3 h-3" />
                                  <span>Téléchargé</span>
                                </span>
                              )}
                              {processedFile && !downloadSuccess && (
                                <span className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
                                  Prêt à télécharger
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message de succès après téléchargement */}
              {downloadSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-600 rounded-lg flex items-center space-x-3 shadow-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-lg text-green-900">Téléchargement réussi !</p>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Le fichier <strong className="font-semibold">{processedFile?.filename}</strong> a été téléchargé avec succès dans votre dossier de téléchargements.
                    </p>
                  </div>
                  <button
                    onClick={() => setDownloadSuccess(false)}
                    className="text-green-700 hover:text-green-900 p-1"
                    title="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {selectedTool === 'video-convert' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Format vidéo</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {['MP4', 'AVI', 'MOV', 'WebM', 'MKV', 'FLV'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedVideoFormat(fmt)}
                        className={`px-4 py-3 border-2 rounded-lg transition-colors font-medium ${
                          selectedVideoFormat === fmt
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

              {selectedTool === 'audio-convert' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Format audio</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {['MP3', 'WAV', 'FLAC', 'AAC', 'OGG'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedAudioFormat(fmt)}
                        className={`px-4 py-3 border-2 rounded-lg transition-colors font-medium ${
                          selectedAudioFormat === fmt
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

              {selectedTool === 'trim' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Découpage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="time" step="1" placeholder="Début" className="px-4 py-3 border-2 border-border rounded-lg" />
                    <input type="time" step="1" placeholder="Fin" className="px-4 py-3 border-2 border-border rounded-lg" />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Bouton Traiter */}
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
                      <Upload className="w-5 h-5" />
                      <span>Traiter</span>
                    </>
                  )}
                </button>

                {/* Bouton Télécharger - visible uniquement après traitement */}
                {processedFile && !isProcessing && (
                  <button
                    onClick={handleDownload}
                    className="w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="w-5 h-5" />
                    <span>Télécharger</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">10+</div>
            <p className="text-sm text-muted-foreground">Formats vidéo supportés</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">8+</div>
            <p className="text-sm text-muted-foreground">Formats audio supportés</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">4K</div>
            <p className="text-sm text-muted-foreground">Résolution maximale</p>
          </div>
        </div>
      </div>
    </div>
  );
}
