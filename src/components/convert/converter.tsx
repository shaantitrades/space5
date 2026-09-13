'use client';

import { useState } from 'react';
import { Upload, Download, File, Loader2, X, Settings, History, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from './file-upload';
import { FormatSelector } from './format-selector';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';

export function Converter() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const { isAuthenticated: isLoggedIn, isLoading: authLoading } = useAuth();
  const [conversionsUsed, setConversionsUsed] = useState(12); // TODO: Récupérer de l'API
  const [conversionsLimit, setConversionsLimit] = useState(25); // TODO: Récupérer du plan

  const handleFileSelect = (file: File) => {
    setSelectedFiles([...selectedFiles, file]);
    setDownloadUrls([]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0 || !outputFormat) return;

    // Vérifier les limites
    if (!isLoggedIn && selectedFiles.length > 1) {
      toast.error('Connectez-vous pour convertir plusieurs fichiers à la fois !', {
        description: 'Créez un compte gratuit pour débloquer la conversion multiple.'
      });
      return;
    }

    if (conversionsUsed >= conversionsLimit) {
      // TODO: Afficher modal upgrade
      toast.error('Limite atteinte !', {
        description: 'Passez à un plan supérieur ou achetez des crédits pour continuer.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const urls: string[] = [];
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('outputFormat', outputFormat);

        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Conversion failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        urls.push(url);
      }

      setDownloadUrls(urls);
      setConversionsUsed(conversionsUsed + selectedFiles.length);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Conversion échouée', {
        description: 'Une erreur est survenue. Veuillez réessayer.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const remainingConversions = conversionsLimit - conversionsUsed;
  const isLimitClose = remainingConversions <= 5;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Convertisseur de Fichiers
              </h1>
              <p className="text-muted-foreground">
                Convertissez vos fichiers rapidement et en toute sécurité
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                title="Options"
              >
                <Settings className="w-5 h-5" />
              </button>
              <Link
                href="/dashboard/history"
                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                title="Historique"
              >
                <History className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Limite de conversions */}
          {authLoading ? null : !isLoggedIn ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Vous n'êtes pas connecté
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Connectez-vous pour accéder à plus de fonctionnalités : traitement par lot, historique, API...
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    href="/signup"
                    className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    S'inscrire gratuitement
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border ${isLimitClose ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' : 'bg-muted border-border'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Conversions ce mois-ci
                </span>
                <span className="text-sm font-bold">
                  {conversionsUsed} / {conversionsLimit}
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${isLimitClose ? 'bg-orange-500' : 'bg-primary'}`}
                  style={{ width: `${(conversionsUsed / conversionsLimit) * 100}%` }}
                />
              </div>
              {isLimitClose && (
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                  Il vous reste {remainingConversions} conversions. 
                  <Link href="/pricing" className="underline ml-1">Upgrader maintenant</Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Convertisseur principal */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-card border rounded-xl p-6 md:p-8 space-y-6">
            {/* Zone de dépôt */}
            <div>
              <label className="block text-sm font-medium mb-3">
                📁 Fichiers à convertir
              </label>
              <FileUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
              
              {/* Liste des fichiers */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        disabled={isProcessing}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sélecteur de format */}
            <div>
              <label className="block text-sm font-medium mb-3">
                🎯 Format de sortie
              </label>
              <FormatSelector
                inputFile={selectedFiles[0]}
                onFormatSelect={setOutputFormat}
                disabled={isProcessing || selectedFiles.length === 0}
              />
            </div>

            {/* Options avancées */}
            {showOptions && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h3 className="text-sm font-semibold">Options avancées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Compression maximale</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Préserver les métadonnées</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>OCR (reconnaissance texte)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Amélioration qualité IA</span>
                  </label>
                </div>
              </div>
            )}

            {/* Bouton de conversion */}
            <button
              onClick={handleConvert}
              disabled={selectedFiles.length === 0 || !outputFormat || isProcessing}
              className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conversion en cours... ({selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''})
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Convertir {selectedFiles.length > 0 && `(${selectedFiles.length} fichier${selectedFiles.length > 1 ? 's' : ''})`}
                </>
              )}
            </button>

            {/* Résultats */}
            {downloadUrls.length > 0 && (
              <div className="pt-6 border-t space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Download className="w-5 h-5" />
                  <p className="font-semibold">Conversion réussie !</p>
                </div>
                <div className="space-y-2">
                  {downloadUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      download={`converted_${selectedFiles[index]?.name}`}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {selectedFiles[index]?.name}
                      </span>
                      <Download className="w-4 h-4" />
                    </a>
                  ))}
                </div>
                {!isLoggedIn && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      💡 <strong>Inscrivez-vous</strong> pour garder vos fichiers plus longtemps et accéder à l'historique !
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
