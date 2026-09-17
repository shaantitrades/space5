'use client';

import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useConversionHistory } from '@/lib/conversion-history';
import { useConversionProgress } from '@/hooks/use-conversion-progress';
import { uploadWithProgress } from '@/lib/upload-progress';
import { toast } from 'sonner';
import { 
  FileText, 
  Combine, 
  Scissors, 
  Minimize2, 
  FileSearch,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  PenTool,
  PenLine,
  ShieldX,
  FileX,
  Layers,
  Grid3x3,
  Lock,
  Unlock,
  Droplet,
  ImagePlus,
  RotateCw,
  Crop,
  Trash,
  Archive,
  Cloud,
  Link2
} from 'lucide-react';
import { FileUploadSkeleton } from '@/components/ui/file-upload-skeleton';
import { ConversionProgress } from '@/components/ui/conversion-progress';

// Lazy load PDFEditor (3180 lignes - très lourd)
const PDFEditor = lazy(() => 
  import('@/components/editors/pdf-editor').then(mod => ({ default: mod.PDFEditor }))
);

type PDFTool = 
  | 'convert' 
  | 'merge' 
  | 'split' 
  | 'compress' 
  | 'ocr'
  | 'edit'
  | 'annotate'
  | 'sign'
  | 'redact'
  | 'organize'
  | 'protect'
  | 'unlock'
  | 'watermark'
  | 'rotate'
  | 'crop'
  | 'delete-pages';

export default function PDFToolsPage() {
  const searchParams = useSearchParams();
  const { addConversion, updateConversion } = useConversionHistory();
  const { 
    progressState, 
    startProgress, 
    updateProgress, 
    completeProgress, 
    cancelProgress,
    resetProgress,
    abortSignal 
  } = useConversionProgress();
  
  const [selectedTool, setSelectedTool] = useState<PDFTool>('convert');
  // Marges de recadrage, en pourcentage de la taille de chaque page.
  // Le navigateur ne connaît pas la taille réelle des pages : des pourcentages
  // sont la seule unité fiable, et ils restent justes en formats mixtes.
  const [cropMargins, setCropMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOutputFormat, setSelectedOutputFormat] = useState<string>('');
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentConversionId, setCurrentConversionId] = useState<string | null>(null);
  
  // Référence pour scroller vers la zone de dépôt
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  const tools = [
    // Section: Conversion & Transformation
    {
      id: 'convert' as PDFTool,
      name: 'Conversion PDF',
      description: 'Transformer vos documents entre PDF, Word, Excel et formats image',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'merge' as PDFTool,
      name: 'Fusionner PDF',
      description: 'Assemblez plusieurs fichiers PDF en un document unique',
      icon: Combine,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'split' as PDFTool,
      name: 'Scinder et Extraire',
      description: 'Séparez votre PDF en plusieurs fichiers distincts selon vos besoins',
      icon: Scissors,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'compress' as PDFTool,
      name: 'Compresser le PDF',
      description: 'Diminuez la taille de vos fichiers tout en préservant la qualité',
      icon: Minimize2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'ocr' as PDFTool,
      name: 'Reconnaissance de texte',
      description: 'Extrayez le texte de documents scannés ou d\'images avec précision',
      icon: FileSearch,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    // Section: Édition & Annotation
    {
      id: 'edit' as PDFTool,
      name: 'Éditeur PDF Avancé',
      description: 'Personnalisez vos documents avec des modifications textuelles et visuelles',
      icon: Edit,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'annotate' as PDFTool,
      name: 'Annoter le PDF',
      description: 'Enrichissez vos fichiers avec des notes, surlignages et dessins interactifs',
      icon: PenTool,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      id: 'sign' as PDFTool,
      name: 'Remplir et Signer',
      description: 'Remplissez des formulaires PDF et apposez vos signatures électroniques',
      icon: PenLine,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    // Section: Sécurité & Protection
    {
      id: 'redact' as PDFTool,
      name: 'Protection des Données',
      description: 'Masquez de façon permanente les informations confidentielles',
      icon: ShieldX,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'protect' as PDFTool,
      name: 'Sécurisation Avancée',
      description: 'Protégez vos fichiers sensibles avec des mots de passe robustes',
      icon: Lock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'unlock' as PDFTool,
      name: 'Déverrouiller le PDF',
      description: 'Retirez les restrictions d\'accès selon vos besoins légitimes',
      icon: Unlock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'watermark' as PDFTool,
      name: 'Filigranes Personnalisés',
      description: 'Marquez vos documents avec des filigranes textuels ou graphiques',
      icon: Droplet,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    // Section: Organisation & Transformation
    {
      id: 'organize' as PDFTool,
      name: 'Réorganisation de Pages',
      description: 'Gérez la structure de vos documents en réarrangeant les pages',
      icon: Layers,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      id: 'rotate' as PDFTool,
      name: 'Faire Pivoter les Pages',
      description: 'Ajustez l\'orientation de vos pages en mode portrait ou paysage',
      icon: RotateCw,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      id: 'crop' as PDFTool,
      name: 'Recadrer les Pages',
      description: 'Découpez et ajustez les dimensions de vos pages selon vos préférences',
      icon: Crop,
      color: 'text-lime-600',
      bgColor: 'bg-lime-50',
    },
    {
      id: 'delete-pages' as PDFTool,
      name: 'Supprimer des Pages',
      description: 'Retirez une ou plusieurs pages de votre document en quelques clics',
      icon: Trash,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ];

  // Détecter le paramètre 'tool' dans l'URL et sélectionner l'outil correspondant
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (toolParam) {
      const validTool = tools.find(t => t.id === toolParam);
      if (validTool) {
        setSelectedTool(toolParam as PDFTool);
      }
    }
  }, [searchParams]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      
      // Si c'est un fichier PDF unique, ouvrir l'éditeur automatiquement
      // (pour merge/organize, on accepte plusieurs fichiers donc on n'ouvre pas l'éditeur automatiquement)
      if (selectedFiles.length === 1 && selectedFiles[0].type === 'application/pdf') {
        setProcessedFile(selectedFiles[0]);
        setShowEditor(true);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    // Vérifier que le format est sélectionné pour la conversion
    if (selectedTool === 'convert' && !selectedOutputFormat) {
      alert('Veuillez sélectionner un format de sortie');
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();

    // Créer une entrée d'historique
    const toolName = tools.find(t => t.id === selectedTool)?.name || selectedTool;
    const conversionId = `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentConversionId(conversionId);

    addConversion({
      tool: selectedTool,
      toolName,
      inputFileName: files[0].name,
      inputFileSize: files[0].size,
      inputFileType: files[0].type,
      status: 'processing',
    });

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('tool', selectedTool);
      
      // Ajouter le format de sortie pour la conversion
      if (selectedTool === 'convert' && selectedOutputFormat) {
        formData.append('outputFormat', selectedOutputFormat.toLowerCase());
      }

      // Ajouter des options spécifiques selon l'outil
      // Note: Pour une implémentation complète, ces valeurs viendraient d'inputs utilisateur
      if (selectedTool === 'sign') {
        formData.append('signType', 'signature');
        formData.append('x', '50');
        formData.append('y', '50');
        formData.append('pageIndex', '0');
      } else if (selectedTool === 'watermark') {
        formData.append('watermarkText', 'CONFIDENTIEL');
        formData.append('position', 'diagonal');
        formData.append('opacity', '0.3');
        formData.append('fontSize', '48');
        formData.append('angle', '45');
      } else if (selectedTool === 'rotate') {
        formData.append('angle', '90');
      } else if (selectedTool === 'crop') {
        const hasMargin = Object.values(cropMargins).some((value) => value > 0);
        if (!hasMargin) {
          throw new Error('Indiquez au moins une marge de recadrage supérieure à 0 %.');
        }
        formData.append('marginTop', String(cropMargins.top));
        formData.append('marginBottom', String(cropMargins.bottom));
        formData.append('marginLeft', String(cropMargins.left));
        formData.append('marginRight', String(cropMargins.right));
      } else if (selectedTool === 'protect' || selectedTool === 'unlock') {
        // En production, demander le mot de passe à l'utilisateur
        formData.append('password', 'default-password');
      }

      // Démarrer le tracking de progression
      startProgress(files[0].name, files[0].size);
      toast.loading('Conversion en cours...', { id: 'conversion' });

      // Utiliser uploadWithProgress pour tracker la progression
      const response = await uploadWithProgress(
        '/api/pdf/process',
        formData,
        (progress) => updateProgress(progress),
        abortSignal
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || 'Échec du traitement');
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || '';
      
      // Déterminer l'extension du fichier selon le format sélectionné ou le content-type
      let extension = 'pdf';
      if (selectedTool === 'convert' && selectedOutputFormat) {
        // Utiliser le format sélectionné
        const formatLower = selectedOutputFormat.toLowerCase();
        if (formatLower === 'word') extension = 'docx';
        else if (formatLower === 'excel') extension = 'xlsx';
        else if (formatLower === 'jpg' || formatLower === 'jpeg') extension = 'jpg';
        else if (formatLower === 'png') extension = 'png';
        else extension = formatLower;
      } else {
        // Fallback sur le content-type
        if (contentType.includes('text/plain')) extension = 'txt';
        else if (contentType.includes('image/')) extension = contentType.split('/')[1];
        else if (contentType.includes('wordprocessingml')) extension = 'docx';
        else if (contentType.includes('spreadsheetml')) extension = 'xlsx';
      }

      // Créer un fichier à partir du blob
      const processedFile = new File([blob], `result-${selectedTool}.${extension}`, {
        type: blob.type || contentType || `application/${extension}`,
      });

      // Mettre à jour l'historique avec succès
      const endTime = Date.now();
      if (currentConversionId) {
        updateConversion(currentConversionId, {
          status: 'success',
          outputFileName: processedFile.name,
          outputFileSize: processedFile.size,
          outputFileType: processedFile.type,
          duration: endTime - startTime,
        });
      }
      
      // Ouvrir l'éditeur si c'est un PDF
      // Pour conversion: seulement si format de sortie n'est pas spécifié ou est PDF
      // Pour tous les autres outils: toujours ouvrir (ils génèrent des PDF)
      const isPDF = extension === 'pdf' || contentType.includes('application/pdf');
      const shouldOpenEditor = isPDF && (
        selectedTool !== 'convert' || 
        !selectedOutputFormat || 
        selectedOutputFormat.toLowerCase() === 'pdf'
      );
      
      // Compléter la progression et afficher succès
      completeProgress();
      toast.dismiss('conversion');
      toast.success('Conversion réussie!', {
        description: `${processedFile.name} (${(processedFile.size / 1024).toFixed(2)} KB)`
      });
      
      if (shouldOpenEditor) {
        // Ouvrir l'éditeur automatiquement
        setProcessedFile(processedFile);
        setShowEditor(true);
        resetProgress(); // Reset progress après ouverture éditeur
      } else {
        // Télécharger directement pour les autres formats (Word, Excel, JPG, PNG)
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `result-${selectedTool}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Reset progress après téléchargement
        setTimeout(() => resetProgress(), 2000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      
      // Reset progression et afficher erreur
      resetProgress();
      toast.dismiss('conversion');
      toast.error('Erreur de conversion', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
      
      // Mettre à jour l'historique avec erreur
      if (currentConversionId) {
        updateConversion(currentConversionId, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Une erreur est survenue',
          duration: Date.now() - startTime,
        });
      }
      
      alert('Une erreur est survenue lors du traitement');
    } finally {
      setIsProcessing(false);
      setCurrentConversionId(null);
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
    // Télécharger le fichier édité
    const url = URL.createObjectURL(editedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = editedFile.name;
    a.click();
    URL.revokeObjectURL(url);
    
    // Optionnellement, mettre à jour l'état
    setProcessedFile(editedFile);
  };

  // Afficher l'éditeur si nécessaire
  if (showEditor && processedFile) {
    return (
      <Suspense fallback={<FileUploadSkeleton />}>
        <PDFEditor
          file={processedFile}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      </Suspense>
    );
  }

  // Afficher la progress bar pendant le traitement
  if (progressState.isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 flex items-center justify-center">
        <ConversionProgress
          fileName={progressState.fileName}
          fileSize={progressState.fileSize}
          progress={progressState.progress}
          onCancel={cancelProgress}
          isProcessing={progressState.isProcessing}
          startTime={progressState.startTime || undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Outils PDF Professionnels
          </h1>
          <p className="text-xl text-muted-foreground">
            Tous vos besoins PDF en un seul endroit
          </p>
        </div>

        {/* Sélection de l'outil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id);
                  // Scroll automatique vers la zone de dépôt
                  setTimeout(() => {
                    uploadZoneRef.current?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }, 100);
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

              {/* Zone de dépôt de fichiers */}
              <div className="mb-6">
                {/* Zone principale drag-and-drop */}
                <label className="block w-full mb-4">
                  <div 
                    ref={uploadZoneRef}
                    className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add('border-primary', 'bg-primary/10');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
                      
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const droppedFiles = Array.from(e.dataTransfer.files);
                        setFiles(droppedFiles);
                        
                        // Si c'est un fichier PDF unique, ouvrir l'éditeur automatiquement
                        if (droppedFiles.length === 1 && droppedFiles[0].type === 'application/pdf') {
                          setProcessedFile(droppedFiles[0]);
                          setShowEditor(true);
                        }
                      }
                    }}
                  >
                    {files.length === 0 ? (
                      <>
                        <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-xl font-bold mb-4">
                          Déposez votre fichier ici
                        </p>
                        <input
                          type="file"
                          multiple={selectedTool === 'merge' || selectedTool === 'organize'}
                          accept={
                            selectedTool === 'ocr' || selectedTool === 'edit' || selectedTool === 'annotate'
                              ? '.pdf,.jpg,.jpeg,.png'
                              : '.pdf,.docx,.xlsx'
                          }
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload-main"
                        />
                        <label
                          htmlFor="file-upload-main"
                          className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          📁 Parcourir fichiers
                        </label>
                        <p className="text-xs text-muted-foreground mt-4">
                          {selectedTool === 'merge' || selectedTool === 'organize' 
                            ? 'Plusieurs PDF acceptés' 
                            : selectedTool === 'ocr' || selectedTool === 'edit' || selectedTool === 'annotate'
                            ? 'PDF ou images acceptés'
                            : 'Jusqu\'à 100 Mo pour les PDF et jusqu\'à 20 Mo pour les formats DOC, DOCX, PPT, PPTX, XLS, XLSX, BMP, JPG, JPEG, GIF, PNG ou TXT'}
                        </p>
                        
                        {/* Boutons d'importation cloud - avec texte */}
                        <div className="mt-6 pt-6 border-t border-border">
                          <p className="text-xs text-muted-foreground text-center mb-3">Ou importer depuis :</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Google Drive */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = selectedTool === 'merge' || selectedTool === 'organize';
                                input.accept = selectedTool === 'ocr' || selectedTool === 'edit' || selectedTool === 'annotate'
                                  ? '.pdf,.jpg,.jpeg,.png'
                                  : '.pdf,.docx,.xlsx';
                                input.onchange = (evt) => {
                                  const target = evt.target as HTMLInputElement;
                                  if (target.files && target.files.length > 0) {
                                    const selectedFiles = Array.from(target.files);
                                    setFiles(selectedFiles);
                                    if (selectedFiles.length === 1 && selectedFiles[0].type === 'application/pdf') {
                                      setProcessedFile(selectedFiles[0]);
                                      setShowEditor(true);
                                    }
                                  }
                                };
                                input.click();
                              }}
                              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-green-400 via-blue-500 to-yellow-400 hover:shadow-lg transition-all text-white"
                            >
                              <Cloud className="w-5 h-5" />
                              <span className="text-xs font-medium">Google Drive</span>
                            </button>

                            {/* Dropbox */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = selectedTool === 'merge' || selectedTool === 'organize';
                                input.accept = selectedTool === 'ocr' || selectedTool === 'edit' || selectedTool === 'annotate'
                                  ? '.pdf,.jpg,.jpeg,.png'
                                  : '.pdf,.docx,.xlsx';
                                input.onchange = (evt) => {
                                  const target = evt.target as HTMLInputElement;
                                  if (target.files && target.files.length > 0) {
                                    const selectedFiles = Array.from(target.files);
                                    setFiles(selectedFiles);
                                    if (selectedFiles.length === 1 && selectedFiles[0].type === 'application/pdf') {
                                      setProcessedFile(selectedFiles[0]);
                                      setShowEditor(true);
                                    }
                                  }
                                };
                                input.click();
                              }}
                              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-500 hover:shadow-lg transition-all text-white"
                            >
                              <Cloud className="w-5 h-5" />
                              <span className="text-xs font-medium">Dropbox</span>
                            </button>

                            {/* OneDrive */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = selectedTool === 'merge' || selectedTool === 'organize';
                                input.accept = selectedTool === 'ocr' || selectedTool === 'edit' || selectedTool === 'annotate'
                                  ? '.pdf,.jpg,.jpeg,.png'
                                  : '.pdf,.docx,.xlsx';
                                input.onchange = (evt) => {
                                  const target = evt.target as HTMLInputElement;
                                  if (target.files && target.files.length > 0) {
                                    const selectedFiles = Array.from(target.files);
                                    setFiles(selectedFiles);
                                    if (selectedFiles.length === 1 && selectedFiles[0].type === 'application/pdf') {
                                      setProcessedFile(selectedFiles[0]);
                                      setShowEditor(true);
                                    }
                                  }
                                };
                                input.click();
                              }}
                              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 hover:shadow-lg transition-all text-white"
                            >
                              <Cloud className="w-5 h-5" />
                              <span className="text-xs font-medium">OneDrive</span>
                            </button>

                            {/* URL */}
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = prompt('Entrez l\'URL du fichier (PDF ou image) :');
                                if (url) {
                                  try {
                                    toast.loading('Téléchargement du fichier...');
                                    const response = await fetch(url);
                                    if (!response.ok) throw new Error('Erreur de téléchargement');
                                    
                                    const blob = await response.blob();
                                    const filename = url.split('/').pop() || 'fichier-importé.pdf';
                                    const file = new File([blob], filename, { type: blob.type });
                                    
                                    setFiles([file]);
                                    if (file.type === 'application/pdf') {
                                      setProcessedFile(file);
                                      setShowEditor(true);
                                    }
                                    toast.dismiss();
                                    toast.success('Fichier importé avec succès !');
                                  } catch (error) {
                                    toast.dismiss();
                                    toast.error('Impossible d\'importer le fichier. Vérifiez l\'URL et réessayez.');
                                  }
                                }
                              }}
                              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-red-500 hover:shadow-lg transition-all text-white"
                            >
                              <Link2 className="w-5 h-5" />
                              <span className="text-xs font-medium">URL</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg mb-4">Fichiers sélectionnés ({files.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                            >
                              {/* Aperçu du fichier */}
                              <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
                                {(file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) ? (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileText className="w-16 h-16 text-primary" />
                                )}
                              </div>
                              
                              {/* Info et boutons */}
                              <div className="p-4">
                                <p className="font-medium text-sm truncate mb-1" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground mb-3">
                                  {(file.size / 1024).toFixed(2)} KB
                                </p>
                                
                                {/* Boutons d'action */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                                        setProcessedFile(file);
                                        setShowEditor(true);
                                      } else {
                                        alert('L\'éditeur est disponible uniquement pour les fichiers PDF');
                                      }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                                    title="Éditer le fichier"
                                  >
                                    <Edit className="w-5 h-5" />
                                    Éditer
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    title="Supprimer le fichier"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Bouton pour ajouter plus de fichiers */}
                        <div className="mt-6">
                          <input
                            type="file"
                            multiple={selectedTool === 'merge' || selectedTool === 'organize'}
                            accept={
                              selectedTool === 'ocr' || selectedTool === 'edit' || selectedTool === 'annotate'
                                ? '.pdf,.jpg,.jpeg,.png'
                                : '.pdf,.docx,.xlsx'
                            }
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const newFiles = Array.from(e.target.files);
                                setFiles([...files, ...newFiles]);
                              }
                            }}
                            className="hidden"
                            id="file-upload-additional"
                          />
                          <label
                            htmlFor="file-upload-additional"
                            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                          >
                            ➕ Ajouter plus de fichiers
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Options spécifiques selon l'outil */}
              {selectedTool === 'convert' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Format de sortie</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Word', 'Excel', 'JPG', 'PNG'].map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedOutputFormat(format)}
                        className={`px-4 py-3 border-2 rounded-lg transition-colors font-medium ${
                          selectedOutputFormat === format
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border hover:border-primary hover:bg-primary/10'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTool === 'compress' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Niveau de compression</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['Faible', 'Moyenne', 'Forte'].map((level) => (
                      <button
                        key={level}
                        className="px-4 py-3 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/10 transition-colors font-medium"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTool === 'ocr' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">Langue du document</h3>
                  <select className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none">
                    <option value="fra">Français</option>
                    <option value="eng">Anglais</option>
                    <option value="ara">Arabe</option>
                    <option value="spa">Espagnol</option>
                    <option value="deu">Allemand</option>
                  </select>
                </div>
              )}

              {selectedTool === 'crop' && files.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-1">Marges de recadrage</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Les marges sont retirées de chaque page, en % de sa taille. Indiquez au moins
                    une marge supérieure à 0 %. Le contenu est conservé, seule la zone visible
                    change.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: 'top' as const, label: 'Marge du haut' },
                      { key: 'bottom' as const, label: 'Marge du bas' },
                      { key: 'left' as const, label: 'Marge gauche' },
                      { key: 'right' as const, label: 'Marge droite' },
                    ]).map(({ key, label }) => (
                      <label key={key} className="flex flex-col gap-1 text-sm font-medium">
                        {label} (%)
                        <input
                          type="number"
                          min={0}
                          max={45}
                          step={1}
                          value={cropMargins[key]}
                          onChange={(e) =>
                            setCropMargins((prev) => ({
                              ...prev,
                              [key]: Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 45),
                            }))
                          }
                          className="px-3 py-2 border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-background"
                        />
                      </label>
                    ))}
                  </div>
                </div>
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

        {/* Informations */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <p className="text-sm text-muted-foreground">Sécurisé et confidentiel</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">Illimité</div>
            <p className="text-sm text-muted-foreground">Fichiers par jour pour Premium</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-3xl font-bold text-primary mb-2">24h</div>
            <p className="text-sm text-muted-foreground">Suppression automatique</p>
          </div>
        </div>

      </div>
    </div>
  );
}
