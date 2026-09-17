'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
  Type,
  Highlighter,
  Square,
  Circle,
  Image as ImageIcon,
  PenTool,
  Download,
  Save,
  Undo,
  Redo,
  X,
  Trash2,
  Bold,
  Italic,
  Underline,
  Minus,
  Plus,
  Eraser,
  ArrowRight,
  Check,
  FileEdit,
  MousePointer2,
  ShieldX,
  Maximize2,
  Upload,
  Printer,
  RotateCw,
  Minimize2,
  MoreVertical,
  StickyNote,
  Search,
  Grid3x3,
  Triangle,
  Hexagon,
  Zap,
  AlertCircle,
  Info,
  Star,
  Heart,
  DollarSign,
  Euro,
  Percent,
  Hash,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Palette,
  ClipboardPaste,
} from 'lucide-react';

interface PDFEditorProps {
  file: File;
  onSave: (editedFile: File) => void;
  onClose: () => void;
}

type Tool = 'select' | 'edit-pdf' | 'sign' | 'text' | 'erase' | 'highlight' | 'redact' | 'image' | 'arrow' | 'draw' | 'cross' | 'check' | 'stamp' | 'rectangle' | 'circle' | 'triangle' | 'hexagon' | 'pentagon' | 'cloud' | 'star' | 'double-arrow' | 'curve' | 'check-icon' | 'cross-icon' | 'star-icon' | 'heart-icon' | 'alert-icon' | 'info-icon' | 'dollar-icon' | 'euro-icon' | 'percent-icon' | 'hash-icon' | 'arrow-up' | 'arrow-down' | 'zap-icon' | 'sparkles-icon';

type EditorAnnotation =
  | {
      id: string;
      page: number;
      type: 'text';
      x: number;
      y: number;
      text: string;
      color?: string;
      fontSize?: number;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
    }
  | {
      id: string;
      page: number;
      type: 'symbol';
      x: number;
      y: number;
      symbol: string;
      color?: string;
      fontSize?: number;
    }
  | {
      id: string;
      page: number;
      type:
        | 'rectangle'
        | 'circle'
        | 'triangle'
        | 'hexagon'
        | 'pentagon'
        | 'star'
        | 'cloud'
        | 'highlight'
        | 'erase'
        | 'redact';
      x: number;
      y: number;
      width?: number;
      height?: number;
      radius?: number;
      color?: string;
      opacity?: number;
    }
  | {
      id: string;
      page: number;
      type: 'arrow' | 'double-arrow' | 'curve';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color?: string;
      width?: number;
    }
  | {
      id: string;
      page: number;
      type: 'draw';
      points: { x: number; y: number }[];
      color?: string;
      width?: number;
    }
  | {
      id: string;
      page: number;
      type: 'image';
      x: number;
      y: number;
      w: number;
      h: number;
      src: string; // data url
    }
  | {
      id: string;
      page: number;
      type: 'stamp';
      x: number;
      y: number;
      w: number;
      h: number;
      text: string;
      borderColor?: string;
      bgColor?: string;
      textColor?: string;
    };

export function PDFEditor({ file, onSave, onClose }: PDFEditorProps) {
  const [currentTool, setCurrentTool] = useState<Tool>('text'); // Par défaut sur "text" pour permettre ajout direct
  const [zoom, setZoom] = useState(75); // Réduit de 100 à 75 pour voir le bouton sans scroller
  const [currentPage, setCurrentPage] = useState(1);
  // Fichier PDF source courant (peut changer: mode "Cr�er PDF", import, ajout pages)
  const [sourceFile, setSourceFile] = useState<File>(file);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([]);
  const pdfjsRef = useRef<any>(null);
  const insertPagesInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [exportedFile, setExportedFile] = useState<File | null>(null);
  const [isPostProcessing, setIsPostProcessing] = useState(false);
  const [showOptimizeMenu, setShowOptimizeMenu] = useState(false);
  const [showCompressMenu, setShowCompressMenu] = useState(false);
  const optimizeMenuRef = useRef<HTMLDivElement>(null);
  const compressMenuRef = useRef<HTMLDivElement>(null);
  const [annotations, setAnnotations] = useState<EditorAnnotation[]>([]);
  const annotationsRef = useRef<EditorAnnotation[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [moreMenuTab, setMoreMenuTab] = useState<'shapes' | 'stamps' | 'icons'>('shapes');
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Guides d'alignement
  const [alignmentGuides, setAlignmentGuides] = useState<{ x?: number; y?: number } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Si le parent nous passe un nouveau fichier, on remplace la source et on reset l'�tat
  useEffect(() => {
    setSourceFile(file);
    setExportedFile(null);
    setAnnotations([]);
    annotationsRef.current = [];
    setHistory([]);
    setHistoryIndex(-1);
    setPdfPages([]);
    setCurrentPage(1);
    setContextMenu(null);
    setSelectedAnnotationId(null);
    setEditingTextId(null);
    setTextDraft('');
    setStatusMessage(null);
  }, [file]);

  // Barre d�outils contextuelle (clic sur page / �l�ment)
  const [contextMenu, setContextMenu] = useState<{
    pageX: number;
    pageY: number;
    canvasX: number;
    canvasY: number;
    // Permet d'utiliser les coordonn�es (ex: saisie texte) sans afficher la mini-toolbar.
    showToolbar?: boolean;
  } | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  /** Poignée de redimensionnement survolée (retour visuel avant le clic) */
  const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle | null>(null);
  /** Dernière poignée survolée : évite un rendu à chaque mouvement de souris */
  const hoveredHandleRef = useRef<ResizeHandle | null>(null);

  /** Recherche dans le texte du PDF (document pdf.js conservé pour getTextContent) */
  const pdfDocRef = useRef<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFromPage, setSearchFromPage] = useState(1);
  const [textDraft, setTextDraft] = useState<string>('');
  const [defaultStyle, setDefaultStyle] = useState<{
    color: string;
    fontSize: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
  }>({ color: '#111827', fontSize: 18, bold: false, italic: false, underline: false });

  const [activeStamp, setActiveStamp] = useState<{
    text: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
  } | null>(null);

  // Drag & drop des �l�ments (texte/symboles)
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
    isDragging: boolean;
    /** 'move' (deplacement) ou 'resize' (redimensionnement par une poignee) */
    mode?: 'move' | 'resize';
    /** Coin saisi lors d'un redimensionnement */
    handle?: 'nw' | 'ne' | 'sw' | 'se';
    /** Boite de depart, pour calculer la nouvelle taille */
    startBounds?: { x: number; y: number; w: number; h: number };
    /** Taille de police initiale (texte / symboles) */
    startFontSize?: number;
  } | null>(null);

  // Outils "drag" (surligner/effacer/caviarder/fl�che/dessiner)
  const toolDragRef = useRef<{
    id: string;
    tool:
      | 'highlight'
      | 'erase'
      | 'redact'
      | 'arrow'
      | 'double-arrow'
      | 'curve'
      | 'draw'
      | 'rectangle'
      | 'circle'
      | 'triangle'
      | 'hexagon'
      | 'pentagon'
      | 'star'
      | 'cloud';
    startX: number;
    startY: number;
    pointerId: number;
  } | null>(null);

  const historyRef = useRef<any[]>(history);
  const historyIndexRef = useRef<number>(historyIndex);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const commitAnnotations = (next: EditorAnnotation[]) => {
    annotationsRef.current = next;
    setAnnotations(next);
    const base = historyIndexRef.current >= 0 ? historyRef.current.slice(0, historyIndexRef.current + 1) : [];
    const newHistory = [...base, next];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Si l'utilisateur modifie quelque chose après "Appliquer", il faut ré-appliquer pour télécharger les changements
  useEffect(() => {
    setExportedFile(null);
  }, [annotations]);

  // Fermer les menus Optimiser/Compresser au clic extérieur
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (optimizeMenuRef.current && !optimizeMenuRef.current.contains(t)) setShowOptimizeMenu(false);
      if (compressMenuRef.current && !compressMenuRef.current.contains(t)) setShowCompressMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const genId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const setAnnotationsLive = (updater: (prev: EditorAnnotation[]) => EditorAnnotation[]) => {
    setAnnotations((prev) => {
      const next = updater(prev);
      annotationsRef.current = next;
      return next;
    });
  };

  // Charger le PDF et le convertir en canvas
  useEffect(() => {
    const loadPDF = async () => {
      try {
        // V�rifier que le fichier existe et est valide
        if (!file) {
          throw new Error('Aucun fichier fourni');
        }

        // V�rifier que c'est bien un PDF
        if (sourceFile.type !== 'application/pdf' && !sourceFile.name.toLowerCase().endsWith('.pdf')) {
          throw new Error('Le fichier s�lectionn� n\'est pas un PDF valide');
        }

        // R�initialiser l'�tat
        setPdfPages([]);
        setCurrentPage(1);

        setLoadingProgress(10);

        // V�rifier qu'on est bien c�t� client
        if (typeof window === 'undefined') {
          throw new Error('Le chargement du PDF doit se faire c�t� client uniquement');
        }

        // PDF.js (pdfjs-dist) � configuration robuste pour Next.js 14
        // On utilise le build "legacy" + worker explicite (stable avec Next).
        let pdfjsLib: any;
        try {
          // IMPORTANT: pdfjs-dist@3.x fournit des fichiers .js (pas .mjs).
          // Importer explicitement .js �vite que Next tente de r�soudre pdf.mjs.
          const pdfjsModule: any = await import('pdfjs-dist/legacy/build/pdf.js');
          pdfjsLib = pdfjsModule?.default ?? pdfjsModule;

          if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
            const keys = pdfjsLib ? Object.keys(pdfjsLib).slice(0, 20) : [];
            console.error('pdfjs-dist legacy: structure inattendue', keys);
            throw new Error('pdfjs-dist n\'est pas correctement charg� (getDocument introuvable).');
          }

          // Configurer le worker (indispensable en Next/Webpack)
          try {
            const workerSrc = new URL(
              'pdfjs-dist/legacy/build/pdf.worker.min.js',
              import.meta.url
            ).toString();
            if (pdfjsLib.GlobalWorkerOptions) {
              pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
            }
          } catch (workerErr) {
            console.warn('Impossible de configurer le worker PDF.js:', workerErr);
          }
        } catch (importError: any) {
          console.error('Erreur import/config pdfjs-dist:', importError);
          throw new Error(
            'Erreur de chargement du PDF (moteur PDF). Merci de red�marrer le serveur et de r�essayer.'
          );
        }

        // Garder une r�f�rence pour l'insertion de pages ult�rieure
        pdfjsRef.current = pdfjsLib;
        
        setLoadingProgress(30);

        // Lire le fichier
        let arrayBuffer: ArrayBuffer;
        try {
          arrayBuffer = await sourceFile.arrayBuffer();
          if (!arrayBuffer || arrayBuffer.byteLength === 0) {
            throw new Error('Le fichier est vide');
          }
          setLoadingProgress(40);
        } catch (readError) {
          throw new Error(`Impossible de lire le fichier: ${readError instanceof Error ? readError.message : 'Erreur inconnue'}`);
        }

        // Charger le document PDF avec timeout
        // V�rifier que getDocument existe
        if (!pdfjsLib.getDocument) {
          throw new Error('pdfjs-dist n\'est pas correctement charg�. getDocument n\'est pas disponible.');
        }
        
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0, // R�duire les logs
          isEvalSupported: false, // S�curit�
        });
        
        // Ajouter un timeout pour �viter les blocages infinis
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Le chargement du PDF prend trop de temps')), 30000)
        );

        const pdf = await Promise.race([loadingTask.promise, timeoutPromise]) as any;
        // Motif conservé : recherche plein texte (getTextContent) et navigation
        pdfDocRef.current = pdf;
        setSearchFromPage(1);
        setLoadingProgress(50);
        
        if (!pdf || pdf.numPages === 0) {
          throw new Error('Le PDF ne contient aucune page');
        }

        const totalPages = pdf.numPages;
        const pages: HTMLCanvasElement[] = new Array(totalPages);

        // Rendre d'abord la premi�re page pour un feedback imm�diat
        try {
          const firstPage = await pdf.getPage(1);
          const viewport = firstPage.getViewport({ scale: 1.5 }); // Scale r�duit pour performance
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Impossible d\'obtenir le contexte du canvas');
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await firstPage.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          pages[0] = canvas;
          setLoadingProgress(60);
          
          // Afficher imm�diatement la premi�re page
          setPdfPages([canvas]);
          setCurrentPage(1);
        } catch (firstPageError) {
          console.error('Erreur lors du rendu de la premi�re page:', firstPageError);
          throw firstPageError;
        }

        // Rendre les autres pages en arri�re-plan (si plus d'une page)
        if (totalPages > 1) {
          for (let i = 2; i <= totalPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 1.5 }); // Scale r�duit
              
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              
              if (!context) continue;
              
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              await page.render({
                canvasContext: context,
                viewport: viewport,
              }).promise;

              pages[i - 1] = canvas;
              setLoadingProgress(60 + Math.floor(((i - 1) / totalPages) * 40));
              
              // Mettre � jour progressivement les pages
              setPdfPages(pages.filter(Boolean)); // Filtrer les valeurs undefined
            } catch (pageError) {
              console.error(`Erreur lors du rendu de la page ${i}:`, pageError);
              // Continuer avec les autres pages
            }
          }
        }

        // Mettre � jour avec toutes les pages rendues
        const finalPages = pages.filter(Boolean);
        if (finalPages.length > 0) {
          setPdfPages(finalPages);
        }

        setLoadingProgress(100);
      } catch (error) {
        console.error('Erreur lors du chargement du PDF:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Erreur lors du chargement du PDF. Veuillez v�rifier que le fichier est un PDF valide.';
        toast.error('Erreur de chargement PDF', {
          description: errorMessage
        });
        
        // R�initialiser l'�tat en cas d'erreur
        setPdfPages([]);
        setCurrentPage(1);
      }
    };

    if (file) {
      loadPDF();
    }
  }, [file]);

  // Redessiner la page quand pdfPages, currentPage ou zoom change
  useEffect(() => {
    if (pdfPages.length > 0 && currentPage > 0 && currentPage <= pdfPages.length && canvasRef.current) {
      const pageCanvas = pdfPages[currentPage - 1];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (canvas && ctx && pageCanvas) {
        // Ajuster la taille du canvas selon le zoom
        canvas.width = pageCanvas.width * (zoom / 100);
        canvas.height = pageCanvas.height * (zoom / 100);

        // Dessiner la page PDF
        ctx.drawImage(pageCanvas, 0, 0, canvas.width, canvas.height);

        // Dessiner les annotations
        annotations
          .filter((a) => (a as any).page === currentPage)
          .forEach((annotation) => {
            drawAnnotation(ctx, annotation);
          });

        // Element selectionne : contour + poignees de redimensionnement.
        // Toujours affiche, y compris pendant l'edition d'un texte : sinon
        // les poignees restaient invisibles et l'element semblait figé.
        if (selectedAnnotationId) {
          const selected = annotations.find((a) => a.id === selectedAnnotationId);
          if (selected && (selected as any).page === currentPage) {
            drawSelectionOverlay(ctx, selected);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfPages, currentPage, zoom, annotations, selectedAnnotationId, editingTextId, hoveredHandle]);

  // Fermer le menu d�roulant quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        const target = event.target as HTMLElement;
        const menuElement = target.closest('[data-more-menu]');
        if (!menuElement) {
          setShowMoreMenu(false);
        }
      }
    };

    if (showMoreMenu) {
      // Utiliser setTimeout pour �viter que le clic sur le bouton ferme imm�diatement le menu
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMoreMenu]);

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: EditorAnnotation) => {
    ctx.save();
    // @ts-expect-error (union)
    ctx.globalAlpha = (annotation as any).opacity || 1;

    switch (annotation.type) {
      case 'rectangle':
        ctx.strokeStyle = annotation.color || '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(annotation.x, annotation.y, annotation.width || 120, annotation.height || 80);
        break;
      case 'circle':
        ctx.strokeStyle = annotation.color || '#000000';
        ctx.lineWidth = 2;
        {
          const w = annotation.width || (annotation.radius ? annotation.radius * 2 : 80);
          const h = annotation.height || (annotation.radius ? annotation.radius * 2 : 80);
          const cx = annotation.x + w / 2;
          const cy = annotation.y + h / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
      case 'triangle': {
        const w = annotation.width || 140;
        const h = annotation.height || 120;
        ctx.strokeStyle = annotation.color || '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(annotation.x + w / 2, annotation.y);
        ctx.lineTo(annotation.x + w, annotation.y + h);
        ctx.lineTo(annotation.x, annotation.y + h);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'hexagon':
      case 'pentagon':
      case 'star':
      case 'cloud': {
        const w = annotation.width || 140;
        const h = annotation.height || 120;
        const cx = annotation.x + w / 2;
        const cy = annotation.y + h / 2;
        ctx.strokeStyle = annotation.color || '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (annotation.type === 'cloud') {
          // nuage simple (bulles)
          const r = Math.min(w, h) / 6;
          ctx.moveTo(cx - w * 0.25, cy + r);
          ctx.arc(cx - w * 0.25, cy, r, Math.PI / 2, (Math.PI * 3) / 2);
          ctx.arc(cx - w * 0.05, cy - r, r * 1.1, Math.PI, 0);
          ctx.arc(cx + w * 0.15, cy - r * 0.8, r * 1.2, Math.PI, 0);
          ctx.arc(cx + w * 0.3, cy, r, (Math.PI * 3) / 2, Math.PI / 2);
          ctx.closePath();
          ctx.stroke();
          break;
        }

        if (annotation.type === 'star') {
          const spikes = 5;
          const outerR = Math.min(w, h) / 2;
          const innerR = outerR * 0.5;
          let rot = -Math.PI / 2;
          const step = Math.PI / spikes;
          ctx.moveTo(cx, cy - outerR);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
            rot += step;
          }
          ctx.closePath();
          ctx.stroke();
          break;
        }

        const sides = annotation.type === 'hexagon' ? 6 : 5;
        const r = Math.min(w, h) / 2;
        for (let i = 0; i < sides; i++) {
          const ang = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
          const px = cx + Math.cos(ang) * r;
          const py = cy + Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'highlight':
        ctx.fillStyle = annotation.color || 'yellow';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(annotation.x, annotation.y, annotation.width || 160, annotation.height || 30);
        break;
      case 'erase':
        // "Effacer" = rectangle blanc (masque visuel)
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 1;
        ctx.fillRect(annotation.x, annotation.y, annotation.width || 160, annotation.height || 40);
        break;
      case 'redact':
        // "Caviarder" = rectangle noir
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 1;
        ctx.fillRect(annotation.x, annotation.y, annotation.width || 160, annotation.height || 40);
        break;
      case 'text':
        ctx.fillStyle = annotation.color || '#000000';
        ctx.font = `${annotation.italic ? 'italic ' : ''}${annotation.bold ? 'bold ' : ''}${annotation.fontSize || 16}px Arial`;
        ctx.fillText(annotation.text || '', annotation.x, annotation.y);
        if (annotation.underline && annotation.text) {
          const metrics = ctx.measureText(annotation.text);
          const underlineY = annotation.y + 3;
          ctx.beginPath();
          ctx.strokeStyle = annotation.color || '#000000';
          ctx.lineWidth = 2;
          ctx.moveTo(annotation.x, underlineY);
          ctx.lineTo(annotation.x + metrics.width, underlineY);
          ctx.stroke();
        }
        break;
      case 'symbol': {
        ctx.fillStyle = annotation.color || '#000000';
        ctx.font = `${annotation.fontSize || 22}px Arial`;
        ctx.fillText(annotation.symbol || '', annotation.x, annotation.y);
        break;
      }
      case 'arrow':
      case 'double-arrow':
      case 'curve': {
        const { x1, y1, x2, y2 } = annotation;
        const color = annotation.color || '#111827';
        const w = annotation.width || 3;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = w;
        if (annotation.type === 'curve') {
          const cx = (x1 + x2) / 2;
          const cy = Math.min(y1, y2) - 40;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cx, cy, x2, y2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        const drawHead = (fromX: number, fromY: number, toX: number, toY: number) => {
          const angle = Math.atan2(toY - fromY, toX - fromX);
          const headLen = 12;
          ctx.beginPath();
          ctx.moveTo(toX, toY);
          ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        };

        // t�te � la fin
        drawHead(x1, y1, x2, y2);
        // double fl�che: t�te au d�but aussi
        if (annotation.type === 'double-arrow') {
          drawHead(x2, y2, x1, y1);
        }
        break;
      }
      case 'draw': {
        const pts = annotation.points || [];
        if (pts.length < 2) break;
        ctx.strokeStyle = annotation.color || '#111827';
        ctx.lineWidth = annotation.width || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        break;
      }
      case 'image': {
        const img = new Image();
        img.src = annotation.src;
        // drawImage sync may fail if not loaded yet; best effort
        try {
          ctx.drawImage(img, annotation.x, annotation.y, annotation.w, annotation.h);
        } catch {}
        break;
      }
      case 'stamp': {
        const w = annotation.w || 220;
        const h = annotation.h || 64;
        const border = annotation.borderColor || '#2563EB';
        const bg = annotation.bgColor || '#EFF6FF';
        const textColor = annotation.textColor || '#1D4ED8';
        // fond
        ctx.fillStyle = bg;
        ctx.strokeStyle = border;
        ctx.lineWidth = 3;
        const r = 10;
        const x = annotation.x;
        const y = annotation.y;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // texte
        ctx.fillStyle = textColor;
        ctx.font = `bold 16px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(annotation.text || '', x + w / 2, y + h / 2);
        break;
      }
    }

    ctx.restore();
  };

  const hitTestAnnotation = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // `annotationsRef` est tenu à jour de façon SYNCHRONE par commitAnnotations et
    // setAnnotationsLive. L'état React, lui, accuse un rendu de retard : un élément
    // qui vient d'être créé ou validé dans le même geste n'était alors pas
    // « attrapable » au clic (impossible de le déplacer ou de le redimensionner).
    const pageAnnotations = annotationsRef.current.filter((a) => (a as any).page === currentPage);
    for (let i = pageAnnotations.length - 1; i >= 0; i--) {
      const a = pageAnnotations[i];
      if (a.type === 'text') {
        ctx.font = `${a.italic ? 'italic ' : ''}${a.bold ? 'bold ' : ''}${a.fontSize || 16}px Arial`;
        const w = ctx.measureText(a.text || '').width;
        const h = a.fontSize || 16;
        const left = a.x;
        const top = a.y - h;
        if (x >= left && x <= left + w && y >= top && y <= top + h) return a;
      } else if (a.type === 'symbol') {
        ctx.font = `${a.fontSize || 22}px Arial`;
        const w = ctx.measureText(a.symbol || '').width;
        const h = a.fontSize || 22;
        const left = a.x;
        const top = a.y - h;
        if (x >= left && x <= left + w && y >= top && y <= top + h) return a;
      } else if (a.type === 'rectangle' || a.type === 'triangle' || a.type === 'hexagon' || a.type === 'pentagon' || a.type === 'star' || a.type === 'cloud' || a.type === 'highlight') {
        const w = a.width || 0;
        const h = a.height || 0;
        if (x >= a.x && x <= a.x + w && y >= a.y && y <= a.y + h) return a;
      } else if (a.type === 'erase' || a.type === 'redact') {
        const w = a.width || 0;
        const h = a.height || 0;
        if (x >= a.x && x <= a.x + w && y >= a.y && y <= a.y + h) return a;
      } else if (a.type === 'circle') {
        const w = a.width || (a.radius ? a.radius * 2 : 0);
        const h = a.height || (a.radius ? a.radius * 2 : 0);
        if (w && h && x >= a.x && x <= a.x + w && y >= a.y && y <= a.y + h) return a;
      } else if (a.type === 'stamp') {
        if (x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h) return a;
      } else if (a.type === 'arrow' || a.type === 'double-arrow' || a.type === 'curve') {
        const minX = Math.min(a.x1, a.x2) - 6;
        const maxX = Math.max(a.x1, a.x2) + 6;
        const minY = Math.min(a.y1, a.y2) - 6;
        const maxY = Math.max(a.y1, a.y2) + 6;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) return a;
      } else if (a.type === 'draw') {
        // bbox rapide
        const pts = a.points || [];
        if (pts.length) {
          let minX = pts[0].x, maxX = pts[0].x, minY = pts[0].y, maxY = pts[0].y;
          for (const p of pts) {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
          }
          if (x >= minX - 6 && x <= maxX + 6 && y >= minY - 6 && y <= maxY + 6) return a;
        }
      } else if (a.type === 'image') {
        if (x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h) return a;
      }
    }
    return null;
  };

  const updateAnnotationLive = (id: string, patch: Partial<EditorAnnotation>) => {
    setAnnotationsLive((prev) => prev.map((a) => (a.id === id ? ({ ...a, ...(patch as any) } as any) : a)));
  };

  // ==========================================================================
  // REDIMENSIONNEMENT DES ÉLÉMENTS
  // ==========================================================================

  /** Taille des poignées dessinées aux coins de l'élément sélectionné (px) */
  const RESIZE_HANDLE_SIZE = 9;
  /** Marge de saisie autour d'une poignée, pour la rendre facile à attraper */
  const RESIZE_HANDLE_TOLERANCE = 12;
  /** Taille minimale d'un élément redimensionné */
  const MIN_ELEMENT_SIZE = 8;
  /** Types sans boîte : leur taille se règle via la police */
  const TEXT_LIKE_TYPES = new Set(['text', 'symbol']);

  type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

  /**
   * Boîte englobante d'une annotation, dans les coordonnées du canvas.
   * Chaque type stocke sa géométrie différemment : on unifie ici pour
   * pouvoir dessiner la sélection et calculer un redimensionnement.
   */
  const getAnnotationBounds = (
    annotation: EditorAnnotation
  ): { x: number; y: number; w: number; h: number } | null => {
    const a = annotation as any;
    const ctx = canvasRef.current?.getContext('2d');

    switch (a.type) {
      case 'text': {
        if (!ctx) return null;
        ctx.save();
        ctx.font = `${a.italic ? 'italic ' : ''}${a.bold ? 'bold ' : ''}${a.fontSize || 16}px Arial`;
        const w = Math.max(ctx.measureText(a.text || '').width, 24);
        ctx.restore();
        const h = a.fontSize || 16;
        return { x: a.x, y: a.y - h, w, h };
      }
      case 'symbol': {
        if (!ctx) return null;
        ctx.save();
        ctx.font = `${a.fontSize || 22}px Arial`;
        const w = ctx.measureText(a.symbol || '').width;
        ctx.restore();
        const h = a.fontSize || 22;
        return { x: a.x, y: a.y - h, w, h };
      }
      case 'circle': {
        const w = a.width || (a.radius ? a.radius * 2 : 0);
        const h = a.height || (a.radius ? a.radius * 2 : 0);
        return { x: a.x, y: a.y, w, h };
      }
      case 'stamp':
      case 'image':
        return { x: a.x, y: a.y, w: a.w || 0, h: a.h || 0 };
      case 'arrow':
      case 'double-arrow':
      case 'curve':
        // Une flèche horizontale ou verticale a une boîte d'épaisseur nulle :
        // on garantit une taille minimale pour que les poignées restent
        // saisissables et que la mise à l'échelle soit fiable (sinon le
        // redimensionnement envoyait la flèche en haut de la page).
        return {
          x: Math.min(a.x1, a.x2),
          y: Math.min(a.y1, a.y2),
          w: Math.max(Math.abs(a.x2 - a.x1), 12),
          h: Math.max(Math.abs(a.y2 - a.y1), 12),
        };
      case 'draw': {
        const points = a.points || [];
        if (!points.length) return null;
        let minX = points[0].x;
        let maxX = points[0].x;
        let minY = points[0].y;
        let maxY = points[0].y;
        for (const point of points) {
          minX = Math.min(minX, point.x);
          maxX = Math.max(maxX, point.x);
          minY = Math.min(minY, point.y);
          maxY = Math.max(maxY, point.y);
        }
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
      }
      default:
        // rectangle, triangle, hexagone, pentagone, étoile, nuage,
        // surlignage, effacement, caviardage
        return { x: a.x, y: a.y, w: a.width || 0, h: a.height || 0 };
    }
  };

  /** Les 4 coins d'une boîte, avec le nom de la poignée correspondante */
  const cornerHandles = (bounds: { x: number; y: number; w: number; h: number }) => [
    { handle: 'nw' as ResizeHandle, x: bounds.x, y: bounds.y },
    { handle: 'ne' as ResizeHandle, x: bounds.x + bounds.w, y: bounds.y },
    { handle: 'sw' as ResizeHandle, x: bounds.x, y: bounds.y + bounds.h },
    { handle: 'se' as ResizeHandle, x: bounds.x + bounds.w, y: bounds.y + bounds.h },
  ];

  /** Le pointeur est-il sur une poignée de l'élément sélectionné ? */
  const hitTestResizeHandle = (x: number, y: number): { id: string; handle: ResizeHandle } | null => {
    if (!selectedAnnotationId) return null;

    const selected = annotationsRef.current.find((a) => a.id === selectedAnnotationId);
    if (!selected || (selected as any).page !== currentPage) return null;

    const bounds = getAnnotationBounds(selected);
    if (!bounds) return null;

    for (const corner of cornerHandles(bounds)) {
      if (
        Math.abs(x - corner.x) <= RESIZE_HANDLE_TOLERANCE &&
        Math.abs(y - corner.y) <= RESIZE_HANDLE_TOLERANCE
      ) {
        return { id: selectedAnnotationId, handle: corner.handle };
      }
    }
    return null;
  };

  /**
   * Retour visuel au survol : met en avant la poignée de redimensionnement
   * (halo bleu, dessiné par drawSelectionOverlay) et adapte le curseur
   * (`nwse-resize` / `nesw-resize` sur une poignée, `move` sur un élément).
   * N'agit que hors glissement, et ne déclenche un rendu que si la poignée change.
   */
  const updateHoverFeedback = (x: number, y: number) => {
    if (dragRef.current?.isDragging || toolDragRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleHit = hitTestResizeHandle(x, y);
    const nextHandle = handleHit?.handle ?? null;

    if (nextHandle !== hoveredHandleRef.current) {
      hoveredHandleRef.current = nextHandle;
      setHoveredHandle(nextHandle);
    }

    const cursor = nextHandle
      ? nextHandle === 'nw' || nextHandle === 'se'
        ? 'nwse-resize'
        : 'nesw-resize'
      : hitTestAnnotation(x, y)
        ? 'move'
        : currentTool !== 'select'
          ? 'crosshair'
          : 'default';

    if (canvas.style.cursor !== cursor) {
      canvas.style.cursor = cursor;
    }
  };

  /**
   * Ouvre (ou rouvre) la saisie d'un texte existant.
   *
   * Avant, l'édition d'un texte déjà posé était impossible : cliquer dessus
   * ne faisait qu'afficher les poignées (« deux points bleus ») sans jamais
   * rendre le clavier. Appelé par le double-clic et par le bouton
   * « Modifier le texte » de la barre d'actions.
   */
  const openTextEditor = (annotation: EditorAnnotation | null | undefined) => {
    const a = annotation as any;
    if (!a || a.type !== 'text') return;

    const canvas = canvasRef.current;
    const bounds = getAnnotationBounds(annotation as EditorAnnotation);
    const rect = canvas?.getBoundingClientRect();
    const canvasX = bounds ? bounds.x : a.x;
    const canvasY = bounds ? bounds.y + bounds.h : a.y;

    setSelectedAnnotationId(a.id);
    setEditingTextId(a.id);
    setTextDraft(a.text || '');
    setContextMenu({
      pageX: (rect?.left ?? 0) + canvasX,
      pageY: (rect?.top ?? 0) + canvasY,
      canvasX,
      canvasY,
    });
  };

  /** Contour de sélection + poignées, dessinés sur le canvas */
  const drawSelectionOverlay = (ctx: CanvasRenderingContext2D, annotation: EditorAnnotation) => {
    const bounds = getAnnotationBounds(annotation);
    if (!bounds) return;

    const { x, y, w, h } = bounds;

    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    ctx.setLineDash([]);

    // Poignées : des carrés blancs bordés de bleu aux quatre coins
    const half = RESIZE_HANDLE_SIZE / 2;
    for (const corner of cornerHandles(bounds)) {
      // Poignée survolée : remplie en bleu avec un halo (l'« ombre »), pour
      // montrer AVANT le clic que la zone de redimensionnement est saisissable.
      const isHovered = hoveredHandle === corner.handle;
      if (isHovered) {
        ctx.save();
        ctx.shadowColor = 'rgba(37, 99, 235, 0.65)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#2563eb';
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(corner.x - half, corner.y - half, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
      ctx.fill();
      ctx.stroke();
      if (isHovered) ctx.restore();
    }
    ctx.restore();
  };

  /**
   * Applique un redimensionnement selon la poignée saisie.
   * Le coin opposé reste fixe et la taille ne descend jamais sous MIN_ELEMENT_SIZE.
   */
  const applyResize = (
    drag: {
      id: string;
      handle?: ResizeHandle;
      startBounds?: { x: number; y: number; w: number; h: number };
      startFontSize?: number;
    },
    pointerX: number,
    pointerY: number
  ) => {
    const start = drag.startBounds;
    if (!start || !drag.handle) return;

    const annotation = (annotationsRef.current as any[]).find((a) => a.id === drag.id);
    if (!annotation) return;

    const isLeftEdge = drag.handle === 'nw' || drag.handle === 'sw';
    const isTopEdge = drag.handle === 'nw' || drag.handle === 'ne';
    const right = start.x + start.w;
    const bottom = start.y + start.h;

    const newX = isLeftEdge ? Math.min(pointerX, right - MIN_ELEMENT_SIZE) : start.x;
    const newY = isTopEdge ? Math.min(pointerY, bottom - MIN_ELEMENT_SIZE) : start.y;
    const newW = Math.max(MIN_ELEMENT_SIZE, isLeftEdge ? right - newX : pointerX - start.x);
    const newH = Math.max(MIN_ELEMENT_SIZE, isTopEdge ? bottom - newY : pointerY - start.y);

    // Garde-fou : si une valeur n'est pas finie (poignées dégénérées, élément
    // sans géométrie), on n'écrit rien. Sans cela, l'élément recevait des
    // coordonnées NaN et « partait » en haut de la page, voire hors de la page.
    if (![newX, newY, newW, newH].every((value) => Number.isFinite(value))) {
      return;
    }

    // Texte et symboles : pas de boîte, on agit sur la taille de la police
    if (TEXT_LIKE_TYPES.has(annotation.type)) {
      const startDistance = Math.hypot(start.w, start.h) || 1;
      const newDistance = Math.hypot(newW, newH) || startDistance;
      const scale = Math.min(Math.max(newDistance / startDistance, 0.25), 8);
      const base = drag.startFontSize ?? annotation.fontSize ?? 16;
      updateAnnotationLive(drag.id, {
        fontSize: Math.round(Math.min(Math.max(base * scale, 6), 240)),
      } as any);
      return;
    }

    const scaleX = start.w > 0 ? newW / start.w : 1;
    const scaleY = start.h > 0 ? newH / start.h : 1;
    const patch: Record<string, unknown> = {};

    if (annotation.type === 'arrow' || annotation.type === 'double-arrow' || annotation.type === 'curve') {
      patch.x1 = newX + (annotation.x1 - start.x) * scaleX;
      patch.y1 = newY + (annotation.y1 - start.y) * scaleY;
      patch.x2 = newX + (annotation.x2 - start.x) * scaleX;
      patch.y2 = newY + (annotation.y2 - start.y) * scaleY;
    } else if (annotation.type === 'draw') {
      patch.points = (annotation.points || []).map((point: { x: number; y: number }) => ({
        x: newX + (point.x - start.x) * scaleX,
        y: newY + (point.y - start.y) * scaleY,
      }));
    } else if (annotation.type === 'image' || annotation.type === 'stamp') {
      patch.x = newX;
      patch.y = newY;
      patch.w = newW;
      patch.h = newH;
    } else if (annotation.type === 'circle') {
      // Un cercle reste rond : on retient la plus grande dimension
      const size = Math.max(newW, newH);
      patch.x = newX;
      patch.y = newY;
      patch.width = size;
      patch.height = size;
      patch.radius = size / 2;
    } else {
      patch.x = newX;
      patch.y = newY;
      patch.width = newW;
      patch.height = newH;
    }

    updateAnnotationLive(drag.id, patch as any);
  };

  /**
   * Agrandit ou reduit l'element selectionne de facon proportionnelle.
   * Utilise par les boutons +/- : plus simple a decouvrir que les poignees.
   * @param factor > 1 pour agrandir, < 1 pour reduire
   */
  const scaleSelectedAnnotation = (factor: number) => {
    if (!selectedAnnotationId) return;

    const a = (annotationsRef.current as any[]).find((x) => x.id === selectedAnnotationId);
    if (!a) return;

    if (TEXT_LIKE_TYPES.has(a.type)) {
      const next = Math.round(Math.min(Math.max((a.fontSize || 16) * factor, 6), 240));
      updateAnnotationLive(a.id, { fontSize: next } as any);
    } else if (a.type === 'draw') {
      // Le trace libre est une suite de points : on ajuste l'epaisseur du trait
      updateAnnotationLive(a.id, { width: Math.min(Math.max((a.width || 3) * factor, 0.5), 40) } as any);
    } else if (a.type === 'arrow' || a.type === 'double-arrow' || a.type === 'curve') {
      // Mise a l'echelle des deux extremites autour du milieu
      const cx = (a.x1 + a.x2) / 2;
      const cy = (a.y1 + a.y2) / 2;
      updateAnnotationLive(a.id, {
        x1: cx + (a.x1 - cx) * factor,
        y1: cy + (a.y1 - cy) * factor,
        x2: cx + (a.x2 - cx) * factor,
        y2: cy + (a.y2 - cy) * factor,
      } as any);
    } else if (a.type === 'image' || a.type === 'stamp') {
      updateAnnotationLive(a.id, {
        w: Math.max(MIN_ELEMENT_SIZE, (a.w || 0) * factor),
        h: Math.max(MIN_ELEMENT_SIZE, (a.h || 0) * factor),
      } as any);
    } else if (a.type === 'circle') {
      const size = Math.max(MIN_ELEMENT_SIZE, (a.width || (a.radius ? a.radius * 2 : 0) || 60) * factor);
      updateAnnotationLive(a.id, { width: size, height: size, radius: size / 2 } as any);
    } else {
      updateAnnotationLive(a.id, {
        width: Math.max(MIN_ELEMENT_SIZE, (a.width || 60) * factor),
        height: Math.max(MIN_ELEMENT_SIZE, (a.height || 40) * factor),
      } as any);
    }

    // Une entree d'historique par clic, pour que l'annulation reste previsible
    commitAnnotations(annotationsRef.current);
  };

  const closeContextMenu = () => {
    // Un texte en cours de saisie est validé avant fermeture : sans cela,
    // l'élément restait vide (invisible et impossible à sélectionner).
    if (editingTextId) {
      commitTextDraft();
    }
    setContextMenu(null);
    setSelectedAnnotationId(null);
    setEditingTextId(null);
    setTextDraft('');
  };

  const shouldShowToolbarForTool = (tool: Tool) => {
    // La mini-toolbar ne doit s'afficher que quand on sélectionne/manipule des éléments existants.
    // Pas pendant l'écriture ou l'ajout de nouveaux éléments.
    return false; // Désactivé: ne s'affiche que sur clic d'élément
  };

  // Fonction pour découper un texte long en lignes avec retour automatique
  const wrapText = (text: string, maxWidth: number, fontSize: number): string => {
    const canvas = canvasRef.current;
    if (!canvas) return text;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return text;
    
    // Configurer le style pour mesurer correctement
    ctx.font = `${fontSize}px Arial`;
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  };

  const insertTextAt = (
    x: number,
    y: number,
    opts?: {
      text?: string;
      style?: Partial<{
        color: string;
        fontSize: number;
        bold: boolean;
        italic: boolean;
        underline: boolean;
      }>;
      openEditor?: boolean;
      /** Position écran du panneau de saisie (ouvre l'édition immédiatement) */
      menu?: { pageX: number; pageY: number };
    }
  ) => {
    const id = genId();
    let text = opts?.text ?? '';
    const style = opts?.style ?? {};
    const fontSize = style.fontSize ?? defaultStyle.fontSize;
    
    // Si le texte est long et ne contient pas déjà des retours à la ligne,
    // appliquer le word wrap automatique
    if (text.length > 50 && !text.includes('\n')) {
      const canvas = canvasRef.current;
      if (canvas) {
        // Largeur max = 70% de la largeur du canvas
        const maxWidth = canvas.width * 0.7;
        text = wrapText(text, maxWidth, fontSize);
      }
    }
    
    const ann: EditorAnnotation = {
      id,
      page: currentPage,
      type: 'text',
      x,
      y,
      text,
      color: style.color ?? defaultStyle.color,
      fontSize,
      bold: style.bold ?? defaultStyle.bold,
      italic: style.italic ?? defaultStyle.italic,
      underline: style.underline ?? defaultStyle.underline,
    };
    commitAnnotations([...annotationsRef.current, ann]);
    setSelectedAnnotationId(id);
    if (opts?.openEditor !== false) {
      setEditingTextId(id);
      setTextDraft(text);
      // Le panneau de saisie s'ouvre ICI (et non via un second événement) :
      // l'outil repasse en « sélection » juste après, et l'ancien code refermait
      // le panneau au clic suivant — l'élément restait donc vide, donc insaisissable.
      if (opts?.menu) {
        setContextMenu({ pageX: opts.menu.pageX, pageY: opts.menu.pageY, canvasX: x, canvasY: y });
      }
    }
    // Outil à usage unique : retour à la sélection pour ne plus créer d'élément
    // à chaque clic sur la page.
    setCurrentTool('select');
  };

  const insertSymbolAt = (x: number, y: number, symbol: string) => {
    const id = genId();
    const ann: EditorAnnotation = {
      id,
      page: currentPage,
      type: 'symbol',
      x,
      y,
      symbol,
      color: defaultStyle.color,
      fontSize: Math.max(20, defaultStyle.fontSize + 2),
    };
    commitAnnotations([...annotationsRef.current, ann]);
    setSelectedAnnotationId(id);
    // Outil à usage unique : sinon chaque clic ajoutait un nouveau symbole
    setCurrentTool('select');
  };

  const insertImageAt = async (x: number, y: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (ev: Event) => {
      const t = ev.target as HTMLInputElement;
      const f = t.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result || '');
        const img = new Image();
        img.onload = () => {
          const maxW = 260;
          const scale = img.width > maxW ? maxW / img.width : 1;
          const w = Math.max(40, img.width * scale);
          const h = Math.max(40, img.height * scale);
          const ann: EditorAnnotation = {
            id: genId(),
            page: currentPage,
            type: 'image',
            x,
            y,
            w,
            h,
            src,
          };
          commitAnnotations([...annotationsRef.current, ann]);
          setSelectedAnnotationId(ann.id);
          // Outil à usage unique
          setCurrentTool('select');
        };
        img.src = src;
      };
      reader.readAsDataURL(f);
    };
    input.click();
  };

  const startBoxShapeTool = (
    kind:
      | 'rectangle'
      | 'circle'
      | 'triangle'
      | 'hexagon'
      | 'pentagon'
      | 'star'
      | 'cloud'
      | 'highlight'
      | 'erase'
      | 'redact',
    x: number,
    y: number
  ) => {
    const id = genId();
    const ann: EditorAnnotation = {
      id,
      page: currentPage,
      type: kind as any,
      x,
      y,
      width: 1,
      height: 1,
      color: kind === 'highlight' ? '#FDE047' : kind === 'erase' ? '#FFFFFF' : kind === 'redact' ? '#000000' : defaultStyle.color,
      opacity: kind === 'highlight' ? 0.35 : 1,
    } as any;
    setSelectedAnnotationId(id);
    setAnnotationsLive((prev) => [...prev, ann]);
    setSelectedAnnotationId(ann.id);
    return id;
  };

  // (compat) alias pour highlight/erase/redact
  const startRectTool = (kind: 'highlight' | 'erase' | 'redact', x: number, y: number) =>
    startBoxShapeTool(kind, x, y);

  const startLineTool = (kind: 'arrow' | 'double-arrow' | 'curve', x: number, y: number) => {
    const id = genId();
    const ann: EditorAnnotation = {
      id,
      page: currentPage,
      type: kind,
      x1: x,
      y1: y,
      x2: x,
      y2: y,
      color: defaultStyle.color,
      width: 3,
    };
    setSelectedAnnotationId(id);
    setAnnotationsLive((prev) => [...prev, ann]);
    setSelectedAnnotationId(ann.id);
    return id;
  };

  const startDrawTool = (x: number, y: number) => {
    const id = genId();
    const ann: EditorAnnotation = {
      id,
      page: currentPage,
      type: 'draw',
      points: [{ x, y }],
      color: defaultStyle.color,
      width: 3,
    };
    setSelectedAnnotationId(id);
    setAnnotationsLive((prev) => [...prev, ann]);
    setSelectedAnnotationId(ann.id);
    return id;
  };

  const deleteSelected = () => {
    if (!selectedAnnotationId) return;
    commitAnnotations(annotationsRef.current.filter((a) => a.id !== selectedAnnotationId));
    setSelectedAnnotationId(null);
  };

  /**
   * Supprime une annotation par son identifiant.
   *
   * ⚠️ Cette fonction était appelée (validation d'un texte vide, bouton
   * « Supprimer ») sans avoir jamais été définie : elle levait une
   * ReferenceError, ce qui faisait échouer la suppression.
   */
  const deleteAnnotation = (id: string) => {
    if (!id) return;
    commitAnnotations(annotationsRef.current.filter((a) => a.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
    if (editingTextId === id) {
      setEditingTextId(null);
      setTextDraft('');
    }
  };

  const updateSelected = (patch: Partial<EditorAnnotation>) => {
    if (!selectedAnnotationId) return;
    commitAnnotations(
      annotationsRef.current.map((a) =>
        a.id === selectedAnnotationId ? ({ ...a, ...(patch as any) } as any) : a
      )
    );
  };

  const commitTextDraft = () => {
    if (!editingTextId) return;
    
    let finalText = textDraft.trim();
    
    // Si le texte est vide, supprimer l'élément au lieu de le garder vide
    if (!finalText) {
      deleteAnnotation(editingTextId);
      setEditingTextId(null);
      setTextDraft('');
      return;
    }
    
    // Appliquer le word wrap si le texte est long et n'a pas de retours à la ligne
    if (finalText.length > 50 && !finalText.includes('\n')) {
      const canvas = canvasRef.current;
      if (canvas) {
        const selected = annotations.find((a) => a.id === editingTextId) as any;
        const fontSize = selected?.fontSize || defaultStyle.fontSize;
        const maxWidth = canvas.width * 0.7;
        finalText = wrapText(finalText, maxWidth, fontSize);
      }
    }
    
    updateSelected({ text: finalText } as any);
    setEditingTextId(null);
    setTextDraft('');
  };

  // Fermer la mini-toolbar si clic ailleurs
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!contextMenu) return;
      const t = e.target as HTMLElement;
      if (t.closest('[data-pdf-context-toolbar]')) return;
      if (t.closest('[data-pdf-canvas]')) return;
      if (t.closest('[data-pdf-canvas-area]')) return;
      closeContextMenu();
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [contextMenu]);

  // Gestion du drag & drop (mousemove/up globaux)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      const canvas = canvasRef.current;
      if (!d?.isDragging || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Redimensionnement par une poignee : on ne deplace pas l'element,
      // on modifie sa taille (ou sa police pour le texte).
      if (d.mode === 'resize') {
        applyResize(d, x, y);
        return;
      }

      const newX = x - d.offsetX;
      const newY = y - d.offsetY;

      // Détecter les lignes d'alignement (tolérance de 5px)
      const tolerance = 5;
      let guideX: number | undefined;
      let guideY: number | undefined;

      // Comparer avec les autres éléments pour l'alignement
      annotations.forEach((ann) => {
        if (ann.id === d.id) return;
        
        // Alignement vertical (même X)
        if (Math.abs(ann.x - newX) < tolerance) {
          guideX = ann.x;
        }
        
        // Alignement horizontal (même Y)
        if (Math.abs(ann.y - newY) < tolerance) {
          guideY = ann.y;
        }
      });

      // Afficher les guides
      setAlignmentGuides(guideX !== undefined || guideY !== undefined ? { x: guideX, y: guideY } : null);

      // Snap to guide si disponible
      updateAnnotationLive(d.id, { 
        x: guideX !== undefined ? guideX : newX, 
        y: guideY !== undefined ? guideY : newY 
      } as any);
    };

    const onUp = () => {
      const d = dragRef.current;
      if (!d?.isDragging) return;
      dragRef.current = null;
      setAlignmentGuides(null); // Cacher les guides
      // Enregistrer une seule entrée d'historique à la fin du drag
      // (annotationsRef est toujours à jour, y compris après un redimensionnement)
      commitAnnotations(annotationsRef.current);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    // Filets de securite : si l'evenement souris est intercepte par un element
    // qui capture le pointeur, ces evenements permettent tout de meme de
    // terminer le glissement (l'element ne reste plus colle au curseur).
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  const hexToRgb01 = (hex: string) => {
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  };

  const buildEditedPdf = async () => {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const srcBytes = await sourceFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(srcBytes);

    const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const helvBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    const renderScale = 1.5; // viewport scale utilis� pour g�n�rer les canvases pdf.js
    const zoomScale = zoom / 100;

    const pages = pdfDoc.getPages();
    const anns = annotationsRef.current;

    const b64ToU8 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    const embedTextAsPng = async (page: any, opts: {
      text: string;
      x: number;
      yBaseline: number;
      size: number;
      colorHex: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
    }) => {
      const pad = 3;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const fontStyle = `${opts.italic ? 'italic ' : ''}${opts.bold ? 'bold ' : ''}${opts.size}px Arial`;
      ctx.font = fontStyle;
      ctx.textBaseline = 'alphabetic';

      const metrics = ctx.measureText(opts.text);
      const textW = Math.ceil(metrics.width);
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent || opts.size * 0.8);
      const descent = Math.ceil(metrics.actualBoundingBoxDescent || opts.size * 0.3);

      canvas.width = textW + pad * 2;
      canvas.height = ascent + descent + pad * 2;

      // redraw after resizing
      const ctx2 = canvas.getContext('2d');
      if (!ctx2) return;
      ctx2.font = fontStyle;
      ctx2.textBaseline = 'alphabetic';
      ctx2.fillStyle = opts.colorHex;
      ctx2.fillText(opts.text, pad, pad + ascent);

      if (opts.underline) {
        ctx2.strokeStyle = opts.colorHex;
        ctx2.lineWidth = Math.max(1, opts.size / 12);
        const underlineY = pad + ascent + 2;
        ctx2.beginPath();
        ctx2.moveTo(pad, underlineY);
        ctx2.lineTo(pad + textW, underlineY);
        ctx2.stroke();
      }

      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1] || '';
      const pngBytes = b64ToU8(base64);
      const embedded = await pdfDoc.embedPng(pngBytes);

      // Positionner l'image pour que sa baseline corresponde � yBaseline
      const imgW = canvas.width;
      const imgH = canvas.height;
      const pdfY = opts.yBaseline - (descent + pad); // approx: bottom under baseline
      page.drawImage(embedded, {
        x: opts.x,
        y: pdfY,
        width: imgW,
        height: imgH,
      });
    };

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageNumber = pageIndex + 1;
      const page = pages[pageIndex];
      const { width: pw, height: ph } = page.getSize();

      const pageAnns = anns.filter((a: any) => a.page === pageNumber);
      for (const a of pageAnns as any[]) {
        // Convertir coords canvas (zoom�es) -> coords pdf (points)
        const ux = (a.x ?? 0) / zoomScale;
        const uy = (a.y ?? 0) / zoomScale;
        const uw = (a.width ?? a.w ?? 0) / zoomScale;
        const uh = (a.height ?? a.h ?? 0) / zoomScale;
        const pdfX = ux / renderScale;

        if (a.type === 'text') {
          const size = (a.fontSize || 16) / renderScale;
          const c = hexToRgb01(a.color || '#111827');
          const font =
            a.bold && a.italic ? helvBoldOblique : a.bold ? helvBold : a.italic ? helvOblique : helv;

          const pdfY = ph - uy / renderScale - size; // approx baseline
          try {
            page.drawText(a.text || '', {
              x: pdfX,
              y: pdfY,
              size,
              font,
              color: rgb(c.r, c.g, c.b),
            });

            if (a.underline && a.text) {
              const textWidth = font.widthOfTextAtSize(a.text || '', size);
              page.drawLine({
                start: { x: pdfX, y: pdfY - 1 },
                end: { x: pdfX + textWidth, y: pdfY - 1 },
                thickness: Math.max(1, size / 12),
                color: rgb(c.r, c.g, c.b),
              });
            }
          } catch (err) {
            // Fallback Unicode: rasteriser en PNG pour supporter tous caract�res
            await embedTextAsPng(page, {
              text: a.text || '',
              x: pdfX,
              yBaseline: pdfY + size, // convert baseline-ish
              size,
              colorHex: a.color || '#111827',
              bold: Boolean(a.bold),
              italic: Boolean(a.italic),
              underline: Boolean(a.underline),
            });
          }
        } else if (a.type === 'symbol') {
          const size = (a.fontSize || 22) / renderScale;
          const c = hexToRgb01(a.color || '#111827');
          const pdfY = ph - uy / renderScale - size;
          try {
            page.drawText(a.symbol || '', { x: pdfX, y: pdfY, size, font: helv, color: rgb(c.r, c.g, c.b) });
          } catch (err) {
            await embedTextAsPng(page, {
              text: a.symbol || '',
              x: pdfX,
              yBaseline: pdfY + size,
              size,
              colorHex: a.color || '#111827',
            });
          }
        } else if (a.type === 'highlight' || a.type === 'erase' || a.type === 'redact') {
          const colorHex =
            a.type === 'highlight' ? '#FDE047' : a.type === 'erase' ? '#FFFFFF' : '#000000';
          const c = hexToRgb01(colorHex);
          const pdfY = ph - uy / renderScale - uh / renderScale;
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: uw / renderScale,
            height: uh / renderScale,
            color: rgb(c.r, c.g, c.b),
            opacity: a.type === 'highlight' ? 0.35 : 1,
            borderWidth: 0,
          });
        } else if (a.type === 'arrow') {
          const x1 = (a.x1 / zoomScale) / renderScale;
          const y1 = ph - (a.y1 / zoomScale) / renderScale;
          const x2 = (a.x2 / zoomScale) / renderScale;
          const y2 = ph - (a.y2 / zoomScale) / renderScale;
          const c = hexToRgb01(a.color || '#111827');
          const thickness = Math.max(1, (a.width || 3) / renderScale);
          page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: rgb(c.r, c.g, c.b) });
          // t�te fl�che (2 petites lignes)
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const head = 10;
          const a1 = angle - Math.PI / 6;
          const a2 = angle + Math.PI / 6;
          page.drawLine({
            start: { x: x2, y: y2 },
            end: { x: x2 - head * Math.cos(a1), y: y2 - head * Math.sin(a1) },
            thickness,
            color: rgb(c.r, c.g, c.b),
          });
          page.drawLine({
            start: { x: x2, y: y2 },
            end: { x: x2 - head * Math.cos(a2), y: y2 - head * Math.sin(a2) },
            thickness,
            color: rgb(c.r, c.g, c.b),
          });
        } else if (a.type === 'draw') {
          const pts = (a.points || []).map((p: any) => ({
            x: (p.x / zoomScale) / renderScale,
            y: ph - (p.y / zoomScale) / renderScale,
          }));
          if (pts.length >= 2) {
            const c = hexToRgb01(a.color || '#111827');
            const thickness = Math.max(1, (a.width || 3) / renderScale);
            for (let i = 1; i < pts.length; i++) {
              page.drawLine({
                start: pts[i - 1],
                end: pts[i],
                thickness,
                color: rgb(c.r, c.g, c.b),
              });
            }
          }
        } else if (a.type === 'double-arrow') {
          const x1 = (a.x1 / zoomScale) / renderScale;
          const y1 = ph - (a.y1 / zoomScale) / renderScale;
          const x2 = (a.x2 / zoomScale) / renderScale;
          const y2 = ph - (a.y2 / zoomScale) / renderScale;
          const c = hexToRgb01(a.color || '#111827');
          const thickness = Math.max(1, (a.width || 3) / renderScale);
          page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color: rgb(c.r, c.g, c.b) });
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const head = 10;
          const a1 = angle - Math.PI / 6;
          const a2 = angle + Math.PI / 6;
          const drawHead = (tx: number, ty: number, ang: number) => {
            page.drawLine({
              start: { x: tx, y: ty },
              end: { x: tx - head * Math.cos(ang - Math.PI / 6), y: ty - head * Math.sin(ang - Math.PI / 6) },
              thickness,
              color: rgb(c.r, c.g, c.b),
            });
            page.drawLine({
              start: { x: tx, y: ty },
              end: { x: tx - head * Math.cos(ang + Math.PI / 6), y: ty - head * Math.sin(ang + Math.PI / 6) },
              thickness,
              color: rgb(c.r, c.g, c.b),
            });
          };
          drawHead(x2, y2, angle);
          drawHead(x1, y1, angle + Math.PI);
        } else if (a.type === 'curve') {
          // Fallback: rasteriser la courbe pour une compatibilit� simple
          const ux1 = (a.x1 / zoomScale);
          const uy1 = (a.y1 / zoomScale);
          const ux2 = (a.x2 / zoomScale);
          const uy2 = (a.y2 / zoomScale);
          const minX = Math.min(ux1, ux2);
          const minY = Math.min(uy1, uy2);
          const w = Math.abs(ux2 - ux1) + 80;
          const h = Math.abs(uy2 - uy1) + 120;
          const tmp = document.createElement('canvas');
          tmp.width = Math.max(120, Math.ceil(w));
          tmp.height = Math.max(120, Math.ceil(h));
          const tctx = tmp.getContext('2d');
          if (tctx) {
            tctx.strokeStyle = a.color || '#111827';
            tctx.lineWidth = 3;
            const x1c = ux1 - minX + 40;
            const y1c = uy1 - minY + 60;
            const x2c = ux2 - minX + 40;
            const y2c = uy2 - minY + 60;
            const cx = (x1c + x2c) / 2;
            const cy = Math.min(y1c, y2c) - 40;
            tctx.beginPath();
            tctx.moveTo(x1c, y1c);
            tctx.quadraticCurveTo(cx, cy, x2c, y2c);
            tctx.stroke();
          }
          const dataUrl = tmp.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1] || '';
          const pngBytes = b64ToU8(base64);
          const embedded = await pdfDoc.embedPng(pngBytes);
          const pdfX2 = (minX / renderScale);
          const pdfY2 = ph - (minY / renderScale) - (tmp.height / renderScale);
          page.drawImage(embedded, {
            x: pdfX2,
            y: pdfY2,
            width: (tmp.width / renderScale),
            height: (tmp.height / renderScale),
          });
        } else if (a.type === 'image') {
          const pdfY = ph - uy / renderScale - (a.h / zoomScale) / renderScale;
          const w = (a.w / zoomScale) / renderScale;
          const h = (a.h / zoomScale) / renderScale;
          const src: string = a.src || '';
          const base64 = src.includes(',') ? src.split(',')[1] : '';
          const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          let embedded;
          if (src.startsWith('data:image/png')) {
            embedded = await pdfDoc.embedPng(bytes);
          } else {
            embedded = await pdfDoc.embedJpg(bytes);
          }
          page.drawImage(embedded, { x: pdfX, y: pdfY, width: w, height: h });
        } else if (a.type === 'stamp') {
          // Tampon: rasterisation (support texte + couleurs sans soucis d'encodage)
          const tmp = document.createElement('canvas');
          tmp.width = 600;
          tmp.height = 160;
          const tctx = tmp.getContext('2d');
          if (tctx) {
            const border = a.borderColor || '#2563EB';
            const bg = a.bgColor || '#EFF6FF';
            const tc = a.textColor || '#1D4ED8';
            const r = 24;
            tctx.fillStyle = bg;
            tctx.strokeStyle = border;
            tctx.lineWidth = 10;
            tctx.beginPath();
            tctx.moveTo(r, 0);
            tctx.lineTo(tmp.width - r, 0);
            tctx.quadraticCurveTo(tmp.width, 0, tmp.width, r);
            tctx.lineTo(tmp.width, tmp.height - r);
            tctx.quadraticCurveTo(tmp.width, tmp.height, tmp.width - r, tmp.height);
            tctx.lineTo(r, tmp.height);
            tctx.quadraticCurveTo(0, tmp.height, 0, tmp.height - r);
            tctx.lineTo(0, r);
            tctx.quadraticCurveTo(0, 0, r, 0);
            tctx.closePath();
            tctx.fill();
            tctx.stroke();
            tctx.fillStyle = tc;
            tctx.font = 'bold 44px Arial';
            tctx.textAlign = 'center';
            tctx.textBaseline = 'middle';
            tctx.fillText(a.text || '', tmp.width / 2, tmp.height / 2);
          }
          const dataUrl = tmp.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1] || '';
          const pngBytes = b64ToU8(base64);
          const embedded = await pdfDoc.embedPng(pngBytes);
          const w = (a.w / zoomScale) / renderScale;
          const h = (a.h / zoomScale) / renderScale;
          const pdfY = ph - uy / renderScale - h;
          page.drawImage(embedded, { x: pdfX, y: pdfY, width: w, height: h });
        } else if (
          ['rectangle', 'circle', 'triangle', 'hexagon', 'pentagon', 'star', 'cloud'].includes(a.type)
        ) {
          // Formes avanc�es: rasteriser (simple + coh�rent avec rendu canvas)
          const wPx = Math.max(20, Math.round((a.width || 140) / zoomScale));
          const hPx = Math.max(20, Math.round((a.height || 120) / zoomScale));
          const tmp = document.createElement('canvas');
          tmp.width = wPx + 20;
          tmp.height = hPx + 20;
          const tctx = tmp.getContext('2d');
          if (tctx) {
            tctx.strokeStyle = a.color || '#111827';
            tctx.lineWidth = 4;
            const ox = 10;
            const oy = 10;
            const kind = a.type;
            if (kind === 'rectangle') {
              tctx.strokeRect(ox, oy, wPx, hPx);
            } else if (kind === 'circle') {
              tctx.beginPath();
              tctx.ellipse(ox + wPx / 2, oy + hPx / 2, wPx / 2, hPx / 2, 0, 0, 2 * Math.PI);
              tctx.stroke();
            } else if (kind === 'triangle') {
              tctx.beginPath();
              tctx.moveTo(ox + wPx / 2, oy);
              tctx.lineTo(ox + wPx, oy + hPx);
              tctx.lineTo(ox, oy + hPx);
              tctx.closePath();
              tctx.stroke();
            } else if (kind === 'star') {
              const cx = ox + wPx / 2;
              const cy = oy + hPx / 2;
              const spikes = 5;
              const outerR = Math.min(wPx, hPx) / 2;
              const innerR = outerR * 0.5;
              let rot = -Math.PI / 2;
              const step = Math.PI / spikes;
              tctx.beginPath();
              tctx.moveTo(cx, cy - outerR);
              for (let i = 0; i < spikes; i++) {
                tctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
                rot += step;
                tctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
                rot += step;
              }
              tctx.closePath();
              tctx.stroke();
            } else if (kind === 'cloud') {
              const cx = ox + wPx / 2;
              const cy = oy + hPx / 2;
              const r = Math.min(wPx, hPx) / 6;
              tctx.beginPath();
              tctx.moveTo(cx - wPx * 0.25, cy + r);
              tctx.arc(cx - wPx * 0.25, cy, r, Math.PI / 2, (Math.PI * 3) / 2);
              tctx.arc(cx - wPx * 0.05, cy - r, r * 1.1, Math.PI, 0);
              tctx.arc(cx + wPx * 0.15, cy - r * 0.8, r * 1.2, Math.PI, 0);
              tctx.arc(cx + wPx * 0.3, cy, r, (Math.PI * 3) / 2, Math.PI / 2);
              tctx.closePath();
              tctx.stroke();
            } else {
              // polygon
              const sides = kind === 'hexagon' ? 6 : 5;
              const cx = ox + wPx / 2;
              const cy = oy + hPx / 2;
              const r = Math.min(wPx, hPx) / 2;
              tctx.beginPath();
              for (let i = 0; i < sides; i++) {
                const ang = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
                const px = cx + Math.cos(ang) * r;
                const py = cy + Math.sin(ang) * r;
                if (i === 0) tctx.moveTo(px, py);
                else tctx.lineTo(px, py);
              }
              tctx.closePath();
              tctx.stroke();
            }
          }
          const dataUrl = tmp.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1] || '';
          const pngBytes = b64ToU8(base64);
          const embedded = await pdfDoc.embedPng(pngBytes);
          const w = (a.width / zoomScale) / renderScale;
          const h = (a.height / zoomScale) / renderScale;
          const pdfY = ph - uy / renderScale - h;
          page.drawImage(embedded, { x: pdfX, y: pdfY, width: w, height: h });
        }
      }
    }

    const outBytes = await pdfDoc.save();
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    const outName = sourceFile.name.toLowerCase().endsWith('.pdf') ? sourceFile.name : `${sourceFile.name}.pdf`;
    return new File([blob], outName, { type: 'application/pdf' });
  };

  /**
   * Recherche plein texte dans le PDF (texte extrait par pdf.js).
   *
   * Place la vue sur la première page qui contient la requête, en reprenant
   * après la page trouvée pour pouvoir enchaîner les recherches (Entrée).
   */
  const handleSearch = async () => {
    const pdf = pdfDocRef.current;
    const query = searchQuery.trim();

    if (!pdf) {
      setSearchMessage('Document non chargé.');
      return;
    }

    if (query.length < 2) {
      setSearchMessage('Saisissez au moins 2 caractères.');
      return;
    }

    setIsSearching(true);
    setSearchMessage(null);

    const needle = query.toLowerCase();
    const total: number = pdf.numPages;
    const start = Math.max(1, Math.min(searchFromPage, total));

    try {
      for (let offset = 0; offset < total; offset++) {
        const pageNumber = ((start - 1 + offset) % total) + 1;

        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = (content.items as any[])
          .map((item) => (typeof item?.str === 'string' ? item.str : ''))
          .join(' ')
          .toLowerCase();

        if (text.includes(needle)) {
          setCurrentPage(pageNumber);
          setSearchFromPage((pageNumber % total) + 1);
          setSearchMessage(`Trouvé à la page ${pageNumber} (sur ${total}).`);
          return;
        }
      }

      setSearchMessage(`Aucun résultat pour « ${query} » dans le texte du PDF.`);
      setSearchFromPage(1);
    } catch {
      setSearchMessage('Recherche impossible sur ce document.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyChanges = async () => {
    // IMPORTANT: "Appliquer les changements" ne doit pas télécharger.
    try {
      setIsApplying(true);
      setStatusMessage('Application des changements…');
      const out = await buildEditedPdf();
      setExportedFile(out);
      setStatusMessage('Changements appliqués. Cliquez sur "Télécharger" pour exporter.');
      window.setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Erreur application changements:', err);
      setStatusMessage('Erreur: impossible d\'appliquer les changements.');
      window.setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsApplying(false);
    }
  };

  const renderPdfCanvasesFromArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
    const pdfjsLib = pdfjsRef.current;
    if (!pdfjsLib?.getDocument) {
      throw new Error('Le moteur PDF n�est pas pr�t.');
    }

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages || 0;
    const canvases: HTMLCanvasElement[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      canvases.push(canvas);
    }

    return canvases;
  };

  const applyNewSourcePdf = async (arrayBuffer: ArrayBuffer, nextName?: string) => {
    const name = nextName || sourceFile.name || 'document.pdf';
    const next = new File([arrayBuffer], name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`, {
      type: 'application/pdf',
    });

    setSourceFile(next);
    setExportedFile(null);

    // Re-render pages (source de v�rit� visuelle)
    const canvases = await renderPdfCanvasesFromArrayBuffer(arrayBuffer);
    setPdfPages(canvases);
    setCurrentPage(Math.min(currentPage, Math.max(1, canvases.length)));
  };

  const handleInsertPagesClick = () => {
    insertPagesInputRef.current?.click();
  };

  const handleInsertPagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length === 0) return;

      // IMPORTANT (pro): ins�rer r�ellement les pages dans le PDF source
      const { PDFDocument } = await import('pdf-lib');
      const baseBytes = await sourceFile.arrayBuffer();
      const baseDoc = await PDFDocument.load(baseBytes);

      const insertIndex0 = Math.min(Math.max(currentPage, 1), baseDoc.getPageCount()); // apr�s page courante
      let cursor = insertIndex0;

      for (const f of files) {
        if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) continue;
        const buf = await f.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf);
        const srcPages = await baseDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        for (const p of srcPages) {
          baseDoc.insertPage(cursor, p);
          cursor += 1;
        }
      }

      const outBytes = await baseDoc.save({ useObjectStreams: true });
      await applyNewSourcePdf(outBytes, sourceFile.name);

      // D�caler les annotations apr�s l'endroit d'insertion
      const insertedCount = cursor - insertIndex0;
      if (insertedCount > 0) {
        const shifted = annotationsRef.current.map((a) => (a.page > currentPage ? { ...a, page: a.page + insertedCount } : a));
        commitAnnotations(shifted);
        setCurrentPage(currentPage + 1);
      }
    } catch (err) {
      console.error('Erreur insertion pages:', err);
      alert('Impossible d�ins�rer les pages. R�essayez avec un PDF valide.');
    } finally {
      // reset pour permettre de re-s�lectionner le m�me fichier
      e.target.value = '';
    }
  };

  const handleAddBlankPage = async () => {
    try {
      const { PDFDocument, PageSizes } = await import('pdf-lib');
      const baseBytes = await sourceFile.arrayBuffer();
      const baseDoc = await PDFDocument.load(baseBytes);

      // Taille: reprendre la page courante si possible, sinon A4
      const pageCount = baseDoc.getPageCount();
      const idx0 = Math.min(Math.max(currentPage - 1, 0), Math.max(0, pageCount - 1));
      const refPage = baseDoc.getPage(idx0);
      const sz = refPage?.getSize?.() ? refPage.getSize() : { width: PageSizes.A4[0], height: PageSizes.A4[1] };

      // Ins�rer apr�s la page courante
      baseDoc.insertPage(Math.min(currentPage, pageCount), [sz.width, sz.height]);

      const outBytes = await baseDoc.save({ useObjectStreams: true });
      await applyNewSourcePdf(outBytes, sourceFile.name);

      // Décaler annotations sur pages suivantes (+1) et aller sur la nouvelle page
      const shifted = annotationsRef.current.map((a) => (a.page > currentPage ? { ...a, page: a.page + 1 } : a));
      commitAnnotations(shifted);
      const newPageNum = currentPage + 1;
      setCurrentPage(newPageNum);
      
      setStatusMessage('Page blanche ajoutée. Cliquez sur "Appliquer les changements" pour exporter.');
      window.setTimeout(() => setStatusMessage(null), 3000);
      
      // Attendre que le canvas soit rendu puis ajouter le champ texte avec curseur
      window.setTimeout(() => {
        const canvas = canvasRef.current;
        const container = canvasContainerRef.current;
        
        if (canvas && container) {
          // Scroll vers le canvas pour qu'il soit visible
          canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Activer l'outil texte
          setCurrentTool('text');
          
          // Ajouter un champ texte en haut à gauche avec focus
          const x = 50;
          const y = 50;
          insertTextAt(x, y, { text: '', openEditor: true });
          
          // Afficher le menu contextuel pour la toolbar
          const rect = canvas.getBoundingClientRect();
          setContextMenu({ 
            pageX: rect.left + x, 
            pageY: rect.top + y, 
            canvasX: x, 
            canvasY: y 
          });
        }
      }, 500);
    } catch (e) {
      console.error('Erreur ajout page blanche:', e);
      alert('Impossible d\'ajouter une page blanche.');
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 25));
  };

  const handleZoomFit = () => {
    setZoom(100);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAnnotations(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAnnotations(history[newIndex]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportNew = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const f = target.files?.[0];
      if (!f) return;
      try {
        const buf = await f.arrayBuffer();
        await applyNewSourcePdf(buf, f.name);
        setExportedFile(null);
        setAnnotations([]);
        annotationsRef.current = [];
        setHistory([]);
        setHistoryIndex(-1);
        setCurrentPage(1);
        setStatusMessage('Nouveau PDF import�.');
        window.setTimeout(() => setStatusMessage(null), 2500);
      } catch (err) {
        console.error('Erreur import nouveau PDF:', err);
        alert('Impossible d�importer ce PDF.');
      } finally {
        target.value = '';
      }
    };
    input.click();
  };

  const parseFilenameFromContentDisposition = (cd: string | null) => {
    if (!cd) return null;
    const m = /filename="([^"]+)"/i.exec(cd);
    return m?.[1] || null;
  };

  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes)) return '�';
    const units = ['o', 'Ko', 'Mo', 'Go'];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
  };

  const getPdfForProcessing = async (): Promise<File> => {
    if (exportedFile) return exportedFile;
    if (annotationsRef.current.length > 0) {
      // Auto-apply (sans télécharger) pour que l'optimisation/ compression prenne en compte les modifications
      const out = await buildEditedPdf();
      setExportedFile(out);
      return out;
    }
    return sourceFile;
  };

  const runPdfPostProcess = async (tool: 'optimize' | 'compress', quality: 'low' | 'medium' | 'high') => {
    try {
      // Cohérence UX: on demande d'abord d'appliquer les changements avant post-traitement
      if (!exportedFile && annotationsRef.current.length > 0) {
        setStatusMessage(`Cliquez sur "Appliquer les changements" avant de ${tool === 'compress' ? 'compresser' : 'optimiser'}.`);
        window.setTimeout(() => setStatusMessage(null), 3500);
        setShowOptimizeMenu(false);
        setShowCompressMenu(false);
        return;
      }

      setIsPostProcessing(true);
      setStatusMessage(tool === 'compress' ? 'Compression en cours�' : 'Optimisation en cours�');

      const source = await getPdfForProcessing();
      const formData = new FormData();
      formData.append('tool', tool);
      formData.append('files', source);
      formData.append('quality', quality);

      const res = await fetch('/api/pdf/process', { method: 'POST', body: formData });
      if (!res.ok) {
        let details = '';
        try {
          const j = await res.json();
          details = j?.details || j?.error || '';
        } catch {}
        throw new Error(details || `Erreur HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const before = source.size;
      const after = blob.size;
      const diff = after - before;
      const pct = before > 0 ? (diff / before) * 100 : 0;

      const name =
        parseFilenameFromContentDisposition(res.headers.get('Content-Disposition')) ||
        (tool === 'compress' ? 'compressed.pdf' : 'optimized.pdf');
      const out = new File([blob], name, { type: blob.type || 'application/pdf' });
      setExportedFile(out);

      // Message clair + transparence sur la taille
      const baseLabel = tool === 'compress' ? 'Compression terminée' : 'Optimisation terminée';
      const sizeInfo = `${formatBytes(before)} → ${formatBytes(after)}`;
      const deltaInfo =
        Math.abs(pct) < 0.25
          ? ' (taille quasi inchangée)'
          : ` (${diff < 0 ? '' : '+'}${pct.toFixed(1)}%)`;

      setStatusMessage(`${baseLabel}: ${sizeInfo}${deltaInfo}. Cliquez sur "Télécharger".`);
      window.setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Erreur post-process PDF:', err);
      setStatusMessage('Erreur: impossible de traiter le PDF.');
      window.setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsPostProcessing(false);
      setShowOptimizeMenu(false);
      setShowCompressMenu(false);
    }
  };

  // Outils principaux de la barre d'outils
  const mainTools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'Déplacer texte' },
    { id: 'edit-pdf' as Tool, icon: FileEdit, label: 'Modifier PDF' },
    { id: 'sign' as Tool, icon: PenTool, label: 'Remplir et Signer' },
    { id: 'text' as Tool, icon: Type, label: 'Texte' },
    { id: 'erase' as Tool, icon: Eraser, label: 'Effacer' },
    { id: 'highlight' as Tool, icon: Highlighter, label: 'Surligner' },
    { id: 'redact' as Tool, icon: ShieldX, label: 'Caviarder' },
    { id: 'image' as Tool, icon: ImageIcon, label: 'Image' },
    { id: 'arrow' as Tool, icon: ArrowRight, label: 'Flèche' },
    { id: 'draw' as Tool, icon: PenTool, label: 'Dessiner' },
    { id: 'cross' as Tool, icon: X, label: 'Croix' },
    { id: 'check' as Tool, icon: Check, label: 'Vérifier' },
  ];

  // Outils de la barre lat�rale (simplifi�s)
  const sideTools = [
    { id: 'text' as Tool, icon: Type, label: 'Texte' },
    { id: 'highlight' as Tool, icon: Highlighter, label: 'Surlignage' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Cercle' },
    { id: 'image' as Tool, icon: ImageIcon, label: 'Image' },
    { id: 'sign' as Tool, icon: PenTool, label: 'Remplir et Signer' },
  ];

  return (
    <div className="fixed inset-0 z-[10000] bg-background flex flex-col">
      {/* Barre d'outils sup�rieure - Header */}
      <div className="bg-card border-b border-border p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold hidden sm:block">Éditeur PDF</h2>
          <span className="text-sm text-muted-foreground ml-2 flex items-center truncate">
            <Upload className="w-4 h-4 mr-1 shrink-0" />
            {sourceFile.name}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleImportNew}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            title="Importer nouveau fichier"
          >
            <Upload className="w-4 h-4" />
            <span className="inline">Importer nouveau</span>
          </button>
          <button
            onClick={handleAddBlankPage}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            title="Ajouter une page blanche"
          >
            <Plus className="w-4 h-4" />
            <span className="inline">Page blanche</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
            title="Imprimer"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              // Télécharger uniquement via ce bouton
              if (exportedFile) {
                onSave(exportedFile);
                return;
              }
              if (annotationsRef.current.length > 0) {
                setStatusMessage('Cliquez sur "Appliquer les changements" avant de télécharger.');
                window.setTimeout(() => setStatusMessage(null), 3000);
                return;
              }
              onSave(sourceFile);
            }}
            className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
            title="Télécharger"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Optimiser */}
          <div className="relative" ref={optimizeMenuRef}>
            <button
              onClick={() => {
                setShowOptimizeMenu((v) => !v);
                setShowCompressMenu(false);
              }}
              disabled={isPostProcessing}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Optimiser"
            >
              <Sparkles className="w-4 h-4" />
              <span className="inline">Optimiser</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showOptimizeMenu ? 'rotate-180' : ''}`} />
            </button>
            {showOptimizeMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {[
                  { k: 'high', label: 'Léger (qualité max)' },
                  { k: 'medium', label: 'Équilibré' },
                  { k: 'low', label: 'Fort (plus agressif)' },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => runPdfPostProcess('optimize', opt.k as any)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compresser */}
          <div className="relative" ref={compressMenuRef}>
            <button
              onClick={() => {
                setShowCompressMenu((v) => !v);
                setShowOptimizeMenu(false);
              }}
              disabled={isPostProcessing}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Compresser"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="inline">Compresser</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCompressMenu ? 'rotate-180' : ''}`} />
            </button>
            {showCompressMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {[
                  { k: 'high', label: 'Léger' },
                  { k: 'medium', label: 'Équilibré' },
                  { k: 'low', label: 'Fort (fichier + petit)' },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    onClick={() => runPdfPostProcess('compress', opt.k as any)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleApplyChanges}
            disabled={isApplying}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>Appliquer les changements</span>
          </button>
          <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-primary/10 text-primary border-b border-primary/20 px-4 py-2 text-sm flex justify-end">
          <span className="text-right">{statusMessage}</span>
        </div>
      )}

      {/* Barre d'outils principale - Toolbar */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center space-x-2 overflow-x-auto">
        {/* Annuler / R�tablir */}
        <div className="flex items-center space-x-1 border-r border-border pr-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="R�tablir"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Outils principaux */}
        <div className="flex flex-wrap items-center gap-1 flex-1 relative">
          {mainTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-red-100 text-red-600 border border-red-300'
                    : 'hover:bg-muted'
                }`}
                title={tool.label}
              >
                <span className="md:hidden" aria-hidden="true">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs md:text-sm font-medium whitespace-nowrap">{tool.label}</span>
              </button>
            );
          })}
          <div className="relative" data-more-menu>
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                if (menuButtonRef.current) {
                  const rect = menuButtonRef.current.getBoundingClientRect();
                  // Le menu fait jusqu'à 500 px de large. S'il est aligné sur la
                  // gauche du bouton et que celui-ci est proche du bord droit,
                  // il déborde hors de l'écran : on le décale vers la gauche
                  // juste ce qu'il faut pour qu'il reste entièrement visible.
                  const menuWidth = Math.min(500, window.innerWidth - 24);
                  const maxLeft = window.innerWidth - menuWidth - 12;
                  setMenuPosition({
                    top: rect.bottom + 8, // 8px en dessous du bouton
                    left: Math.max(12, Math.min(rect.left, maxLeft)),
                  });
                }
                setShowMoreMenu(!showMoreMenu);
              }}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                showMoreMenu
                  ? 'bg-red-100 text-red-600 border border-red-300'
                  : 'hover:bg-muted'
              }`}
              title="Plus d'outils"
            >
              <span className="text-sm font-medium">Plus</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Menu d�roulant Plus - rendu via portal pour �chapper � overflow */}
          {showMoreMenu && typeof window !== 'undefined' && menuPosition && createPortal(
            <>
              {/* Overlay pour fermer le menu */}
              <div 
                className="fixed inset-0 z-[10000]" 
                onClick={() => {
                  setShowMoreMenu(false);
                  setMenuPosition(null);
                }}
              />
              <div 
                className="fixed bg-white border border-border rounded-lg shadow-xl z-[10001] min-w-[400px] max-w-[500px]" 
                data-more-menu
                onClick={(e) => e.stopPropagation()}
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                  maxHeight: '80vh',
                }}
              >
                {/* Onglets */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setMoreMenuTab('shapes')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      moreMenuTab === 'shapes'
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Formes
                  </button>
                  <button
                    onClick={() => setMoreMenuTab('stamps')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      moreMenuTab === 'stamps'
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tampons
                  </button>
                  <button
                    onClick={() => setMoreMenuTab('icons')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      moreMenuTab === 'icons'
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Icônes & Symboles
                  </button>
                </div>

                {/* Contenu des onglets */}
                <div className="p-4 max-h-[400px] overflow-y-auto">
                  {moreMenuTab === 'shapes' && (
                    <div className="grid grid-cols-5 gap-3">
                      {/* Formes existantes am�lior�es */}
                      <button
                        onClick={() => {
                          setCurrentTool('rectangle');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Rectangle"
                      >
                        <Square className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('circle');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Cercle"
                      >
                        <Circle className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('arrow');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Ligne diagonale"
                      >
                        <div className="w-6 h-6 border-t-2 border-r-2 border-foreground transform rotate-45"></div>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('arrow');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Fl�che"
                      >
                        <ArrowRight className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('draw');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center bg-muted"
                        title="Ligne ondul�e"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12c0 0 3-6 6-3s6 6 9 0s6-3 6-3" />
                        </svg>
                      </button>
                      {/* Nouvelles formes avanc�es */}
                      <button
                        onClick={() => {
                          setCurrentTool('triangle');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Triangle"
                      >
                        <Triangle className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('hexagon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Hexagone"
                      >
                        <Hexagon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('star');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="�toile"
                      >
                        <Star className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('cross');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Croix"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('check');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Coche"
                      >
                        <Check className="w-6 h-6" />
                      </button>
                      {/* Formes suppl�mentaires */}
                      <button
                        onClick={() => {
                          setCurrentTool('pentagon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Pentagone"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 9l3 13h14l3-13z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('cloud');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Nuage / Bulle"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('double-arrow');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Fl�che double"
                      >
                        <div className="flex items-center space-x-1">
                          <ChevronLeft className="w-4 h-4" />
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('curve');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Ligne courbe"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12c2-4 7-4 9 0s7 4 9 0" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {moreMenuTab === 'stamps' && (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Tampons standard */}
                      {([
                        { text: 'SIGNER ICI', borderColor: '#EA580C', bgColor: '#FFF7ED', textColor: '#9A3412' },
                        { text: 'INITIALES', borderColor: '#16A34A', bgColor: '#F0FDF4', textColor: '#166534' },
                        { text: 'PAYÉ', borderColor: '#DC2626', bgColor: '#FEF2F2', textColor: '#991B1B' },
                        { text: 'COPIE', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        { text: 'TÉMOIN', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        { text: 'APPROUVÉ', borderColor: '#16A34A', bgColor: '#F0FDF4', textColor: '#166534' },
                        { text: 'NON APPROUVÉ', borderColor: '#DC2626', bgColor: '#FEF2F2', textColor: '#991B1B' },
                        { text: 'BROUILLON', borderColor: '#EA580C', bgColor: '#FFF7ED', textColor: '#9A3412' },
                        { text: 'FINAL', borderColor: '#16A34A', bgColor: '#F0FDF4', textColor: '#166534' },
                        { text: 'COMPLÉTÉ', borderColor: '#16A34A', bgColor: '#F0FDF4', textColor: '#166534' },
                        { text: 'CONFIDENTIEL', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        { text: 'POUR COMMENTAIRE', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        { text: 'ANNULÉ', borderColor: '#DC2626', bgColor: '#FEF2F2', textColor: '#991B1B' },
                        { text: 'POUR INFORMATION SEULEMENT', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        { text: 'AUTORISÉ POUR PUBLICATION', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        { text: 'NON AUTORISÉ À LA PUBLICATION', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        { text: 'RÉSULTATS PRÉLIMINAIRES', borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                        // Tampons dynamiques avec date
                        { text: `SIGNÉ LE ${new Date().toLocaleDateString('fr-FR')}`, borderColor: '#7C3AED', bgColor: '#F5F3FF', textColor: '#6D28D9' },
                        { text: `APPROUVÉ LE ${new Date().toLocaleDateString('fr-FR')}`, borderColor: '#16A34A', bgColor: '#F0FDF4', textColor: '#166534' },
                        { text: `REÇU LE ${new Date().toLocaleDateString('fr-FR')}`, borderColor: '#2563EB', bgColor: '#EFF6FF', textColor: '#1D4ED8' },
                      ] as const).map((stamp, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setActiveStamp(stamp);
                            setCurrentTool('stamp');
                            setShowMoreMenu(false);
                            setStatusMessage('Tampon s�lectionn�. Cliquez sur la page pour le placer.');
                            window.setTimeout(() => setStatusMessage(null), 2500);
                          }}
                          className="p-3 rounded-lg border-2 text-xs font-semibold text-center hover:opacity-80 transition-opacity"
                          style={{
                            borderColor: stamp.borderColor,
                            backgroundColor: stamp.bgColor,
                            color: stamp.textColor,
                          }}
                        >
                          {stamp.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {moreMenuTab === 'icons' && (
                    <div className="grid grid-cols-6 gap-2">
                      {/* Ic�nes courantes */}
                      <button
                        onClick={() => {
                          setCurrentTool('check-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-green-600"
                        title="Coche"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('cross-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-red-600"
                        title="Croix"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('star-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-yellow-600"
                        title="�toile"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('heart-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-red-600"
                        title="C�ur"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('alert-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-orange-600"
                        title="Alerte"
                      >
                        <AlertCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('info-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-blue-600"
                        title="Information"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      {/* Symboles mon�taires */}
                      <button
                        onClick={() => {
                          setCurrentTool('dollar-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-green-600"
                        title="Dollar"
                      >
                        <DollarSign className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('euro-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-blue-600"
                        title="Euro"
                      >
                        <Euro className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('percent-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Pourcentage"
                      >
                        <Percent className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('hash-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Di�se"
                      >
                        <Hash className="w-5 h-5" />
                      </button>
                      {/* Fl�ches directionnelles */}
                      <button
                        onClick={() => {
                          setCurrentTool('arrow-up');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Fl�che haut"
                      >
                        <TrendingUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('arrow-down');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                        title="Fl�che bas"
                      >
                        <TrendingDown className="w-5 h-5" />
                      </button>
                      {/* Autres symboles */}
                      <button
                        onClick={() => {
                          setCurrentTool('zap-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-yellow-600"
                        title="�clair"
                      >
                        <Zap className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTool('sparkles-icon');
                          setShowMoreMenu(false);
                        }}
                        className="p-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-purple-600"
                        title="Étincelles"
                      >
                        <Sparkles className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body
          )}
        </div>

        {/* Outils utilitaires */}
        <div className="flex items-center space-x-1 border-l border-border pl-2">
          <button
            onClick={() => {
              // « Pense-bête » : insère une note texte sur la page et ouvre la saisie.
              const canvas = canvasRef.current;
              if (!canvas) return;
              const x = Math.round(canvas.width * 0.12);
              const y = Math.round(canvas.height * 0.15);
              const rect = canvas.getBoundingClientRect();
              insertTextAt(x, y, {
                text: 'Note : ',
                style: { color: '#B45309', fontSize: Math.max(18, defaultStyle.fontSize) },
                menu: { pageX: rect.left + x, pageY: rect.top + y },
              });
              setStatusMessage('Note ajoutée : saisissez votre texte puis validez (Ctrl+Entrée).');
              window.setTimeout(() => setStatusMessage(null), 4000);
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Pense-bête"
          >
            <StickyNote className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowSearch(true);
              setSearchMessage(null);
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Rechercher"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              // Ouvre le même menu que le bouton « Plus » (formes, tampons, icônes)
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const menuWidth = Math.min(500, window.innerWidth - 24);
              setMenuPosition({
                top: rect.bottom + 8,
                left: Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 12)),
              });
              setShowMoreMenu(true);
            }}
            className="px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            title="Plus d'outils"
          >
            <Grid3x3 className="w-4 h-4 inline mr-1" />
            <span className="hidden md:inline">Plus d'outils</span>
          </button>
        </div>

        {/* Recherche plein texte dans le PDF */}
        {showSearch && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[22rem] bg-white border border-border rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Rechercher dans le PDF</span>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchMessage(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
                title="Fermer"
              >
                Fermer
              </button>
            </div>
            <div className="flex space-x-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchMessage(null);
                  setSearchFromPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleSearch();
                  }
                }}
                placeholder="Texte à rechercher..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => void handleSearch()}
                disabled={isSearching || searchQuery.trim().length < 2}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-50"
              >
                {isSearching ? 'Recherche...' : 'Chercher'}
              </button>
            </div>
            {searchMessage && <p className="mt-2 text-sm text-muted-foreground">{searchMessage}</p>}
            <p className="mt-2 text-xs text-gray-500">
              Le document est analysé page par page et la vue se place sur la première page
              contenant le texte. Appuyez de nouveau sur Entrée pour chercher la suite.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Barre latérale d'outils */}
        <div 
          className="w-16 bg-card border-r border-border p-2 space-y-3 flex flex-col items-center"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton Texte */}
          <button
            onClick={() => setCurrentTool('text')}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              currentTool === 'text' ? 'bg-primary text-white' : 'hover:bg-muted'
            }`}
            title="Ajouter du texte"
          >
            <Type className="w-5 h-5" />
          </button>
          
          {/* Bouton Coller (depuis presse-papiers) */}
          <button
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text && canvasRef.current) {
                  const canvas = canvasRef.current;
                  insertTextAt(canvas.width / 2, canvas.height / 2);
                  setTextDraft(text);
                }
              } catch (err) {
                console.error('Impossible de lire le presse-papiers:', err);
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            title="Coller du texte"
          >
            <ClipboardPaste className="w-5 h-5" />
          </button>
          
          {/* Bouton Symboles */}
          <button
            onClick={() => setCurrentTool('check-icon')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            title="Ajouter des symboles"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          
          {/* Bouton Supprimer */}
          <button
            onClick={() => {
              if (selectedAnnotationId) {
                deleteAnnotation(selectedAnnotationId);
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            title="Supprimer l'élément sélectionné"
            disabled={!selectedAnnotationId}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Zone d'�dition avec contr�les int�gr�s */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center relative">
          {pdfPages.length === 0 ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground mb-2">Chargement du PDF...</p>
              {loadingProgress > 0 && (
                <div className="w-64 mx-auto mt-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{loadingProgress}%</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="relative"
              ref={canvasContainerRef}
              data-pdf-canvas-area
              onPointerDown={(e) => {
                // Ne rien faire si on clique sur la zone de texte en édition
                const target = e.target as HTMLElement;
                if (target.tagName === 'TEXTAREA' || target.closest('[data-text-editor]')) {
                  return;
                }
                
                // Fallback robuste: si le clic ne touche pas exactement le canvas,
                // on ouvre quand même la mini-toolbar et on calcule les coordonnées relatives au canvas.
                const canvas = canvasRef.current;
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                const rawX = e.clientX - rect.left;
                const rawY = e.clientY - rect.top;
                const x = Math.min(Math.max(rawX, 0), rect.width);
                const y = Math.min(Math.max(rawY, 0), rect.height);
                // N'afficher la toolbar que pour certains outils, sinon on la cache.
                if (shouldShowToolbarForTool(currentTool)) {
                  setContextMenu({ pageX: e.clientX, pageY: e.clientY, canvasX: x, canvasY: y });
                } else {
                  setContextMenu(null);
                }
              }}
            >
              {/* Input cach� pour ins�rer plusieurs pages */}
              <input
                ref={insertPagesInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={handleInsertPagesChange}
              />

              {/* Num�ro de page en haut */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground font-medium">
                #{currentPage}
              </div>

              {/**
               * Options de l'element selectionne.
               * Apparait des qu'un element est selectionne : les actions
               * essentielles sont ainsi visibles sans chercher les poignees.
               */}
              {selectedAnnotationId && (() => {
                const selected = annotations.find((a) => a.id === selectedAnnotationId);
                if (!selected || (selected as any).page !== currentPage) return null;

                return (
                  <div
                    data-pdf-element-toolbar
                    className="absolute -top-8 left-0 z-30 flex items-center gap-1 bg-white border border-primary/40 rounded-lg shadow-lg px-1.5 py-1"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => scaleSelectedAnnotation(1.15)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      title="Agrandir l'element"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scaleSelectedAnnotation(1 / 1.15)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      title="Reduire l'element"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSelected()}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                      title="Supprimer l'element"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="hidden md:inline text-xs text-muted-foreground pl-1 pr-1.5 whitespace-nowrap">
                      Glissez pour deplacer, ou un coin bleu pour redimensionner
                    </span>
                  </div>
                );
              })()}

              {/* Bouton ajouter page en haut */}
              <button
                onClick={handleInsertPagesClick}
                className="absolute -top-8 right-0 p-2 rounded-lg hover:bg-white/80 transition-colors"
                title="Ins�rer des pages ici"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Menu page en haut � droite */}
              <button
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/80 transition-colors"
                title="Options de page"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Canvas du PDF */}
              <canvas
                ref={canvasRef}
                className="bg-white shadow-lg pointer-events-auto"
                data-pdf-canvas
                onContextMenu={(e) => {
                  // Désactiver le menu contextuel clic droit
                  e.preventDefault();
                  // Ne rien faire - le clic gauche est utilisé pour ajouter du texte
                }}
                onPointerDown={(e) => {
                  try {
                  // Un texte en cours de saisie est validé avant tout autre geste :
                  // sinon l'élément restait vide (invisible, insaisissable).
                  if (editingTextId) {
                    commitTextDraft();
                  }

                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  const hit = hitTestAnnotation(x, y);

                  // Poignee de redimensionnement : prioritaire sur tout le reste
                  const handleHit = hitTestResizeHandle(x, y);
                  if (handleHit) {
                    e.preventDefault();
                    const target = annotationsRef.current.find((a) => a.id === handleHit.id);
                    const bounds = target ? getAnnotationBounds(target) : null;
                    if (target && bounds) {
                      try {
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      } catch {}
                      dragRef.current = {
                        id: handleHit.id,
                        offsetX: 0,
                        offsetY: 0,
                        isDragging: true,
                        mode: 'resize',
                        handle: handleHit.handle,
                        startBounds: bounds,
                        startFontSize: (target as any).fontSize,
                      };
                      setSelectedAnnotationId(handleHit.id);
                      setEditingTextId(null);
                      return;
                    }
                  }
                  
                  // Ne fermer la zone d'édition que si on clique vraiment ailleurs (pas sur un élément existant en édition)
                  if (!hit || hit.id !== editingTextId) {
                    // Ne plus afficher la toolbar automatiquement
                    if (!editingTextId) {
                      setContextMenu(null);
                    }
                  }

                  if (hit) {
                    // Drag sur éléments quand l'outil "Déplacer texte" est actif
                    // Tous les types positionnes par x/y peuvent etre deplaces,
                    // quel que soit l'outil actif : cliquer sur un element existant
                    // le selectionne et permet de le faire glisser directement.
                    // (Avant, il fallait d'abord basculer sur l'outil Deplacer/Modifier,
                    // ce qui rendait le deplacement impossible a decouvrir.)
                    const isMovable = !['arrow', 'double-arrow', 'curve', 'draw'].includes(hit.type as string);
                    if (isMovable) {
                      e.preventDefault();
                      // Capturer le pointeur pour un drag fluide
                      try {
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      } catch {}
                      dragRef.current = {
                        id: hit.id,
                        offsetX: x - (hit as any).x,
                        offsetY: y - (hit as any).y,
                        isDragging: true,
                      };
                      // Sélectionner l'élément immédiatement
                      setSelectedAnnotationId(hit.id);
                      if (hit.type === 'text') {
                        setTextDraft(hit.text || '');
                      } else {
                        setTextDraft('');
                      }
                      // Pas d'édition inline pendant le drag
                      setEditingTextId(null);
                      return;
                    }
                    
                    // Si on ne drag pas, juste sélectionner l'élément
                    setSelectedAnnotationId(hit.id);
                    if (hit.type === 'text') {
                      setTextDraft(hit.text || '');
                    } else {
                      setTextDraft('');
                    }
                    return;
                  }

                  setSelectedAnnotationId(null);

                  // Clic gauche sur zone vide = ajouter du texte (comportement par défaut)
                  // Si un outil spécifique est actif, on l'utilise
                  // Outil « Texte » : insertion + ouverture IMMÉDIATE du panneau de saisie.
                  // « select » ne crée plus rien : un clic sur une zone vide désélectionne
                  // simplement (avant, chaque clic ajoutait un texte vide de plus).
                  if (currentTool === 'text') {
                    insertTextAt(x, y, { menu: { pageX: e.clientX, pageY: e.clientY } });
                    return;
                  }
                  if (currentTool === 'select' || currentTool === 'edit-pdf') {
                    return;
                  }
                  if (currentTool === 'image') {
                    // pendant ajout d'image, pas besoin de toolbar persistante
                    setContextMenu(null);
                    void insertImageAt(x, y);
                    return;
                  }
                  if (currentTool === 'sign') {
                    // Remplir & Signer: ins�rer une "signature" (texte italic) + ouvrir la saisie,
                    // sans afficher la mini-toolbar.
                    setContextMenu({
                      pageX: e.clientX,
                      pageY: e.clientY,
                      canvasX: x,
                      canvasY: y,
                      showToolbar: false,
                    });
                    insertTextAt(x, y, {
                      text: 'Signature',
                      style: { italic: true, fontSize: Math.max(22, defaultStyle.fontSize) },
                      openEditor: true,
                    });
                    return;
                  }
                  if (currentTool === 'stamp') {
                    if (!activeStamp) {
                      setStatusMessage('Choisissez un tampon dans "Plus ? Tampons"');
                      window.setTimeout(() => setStatusMessage(null), 2500);
                      return;
                    }
                    setContextMenu(null);
                    const ann: EditorAnnotation = {
                      id: genId(),
                      page: currentPage,
                      type: 'stamp',
                      x,
                      y,
                      w: 240,
                      h: 64,
                      text: activeStamp.text,
                      borderColor: activeStamp.borderColor,
                      bgColor: activeStamp.bgColor,
                      textColor: activeStamp.textColor,
                    };
                    commitAnnotations([...annotationsRef.current, ann]);
                    setSelectedAnnotationId(ann.id);
                    // Outil à usage unique
                    setCurrentTool('select');
                    return;
                  }
                  if (currentTool === 'check') {
                    setContextMenu(null);
                    insertSymbolAt(x, y, '✓');
                    return;
                  }
                  if (currentTool === 'cross') {
                    setContextMenu(null);
                    insertSymbolAt(x, y, '✗');
                    return;
                  }
                  // Ic�nes & symboles (Plus)
                  if (
                    [
                      'check-icon',
                      'cross-icon',
                      'star-icon',
                      'heart-icon',
                      'alert-icon',
                      'info-icon',
                      'dollar-icon',
                      'euro-icon',
                      'percent-icon',
                      'hash-icon',
                      'arrow-up',
                      'arrow-down',
                      'zap-icon',
                      'sparkles-icon',
                    ].includes(currentTool)
                  ) {
                    const map: Record<string, string> = {
                      'check-icon': '✓',
                      'cross-icon': '✗',
                      'star-icon': '★',
                      'heart-icon': '♥',
                      'alert-icon': '⚠',
                      'info-icon': 'ℹ',
                      'dollar-icon': '$',
                      'euro-icon': '€',
                      'percent-icon': '%',
                      'hash-icon': '#',
                      'arrow-up': '↑',
                      'arrow-down': '↓',
                      'zap-icon': '⚡',
                      'sparkles-icon': '✨',
                    };
                    setContextMenu(null);
                    insertSymbolAt(x, y, map[currentTool] || '★');
                    return;
                  }
                  if (currentTool === 'highlight' || currentTool === 'erase' || currentTool === 'redact') {
                    setContextMenu(null);
                    e.preventDefault();
                    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
                    const id = startRectTool(currentTool, x, y);
                    toolDragRef.current = { id, tool: currentTool, startX: x, startY: y, pointerId: e.pointerId };
                    return;
                  }
                  if (currentTool === 'arrow') {
                    setContextMenu(null);
                    e.preventDefault();
                    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
                    const id = startLineTool('arrow', x, y);
                    toolDragRef.current = { id, tool: 'arrow', startX: x, startY: y, pointerId: e.pointerId };
                    return;
                  }
                  if (currentTool === 'double-arrow') {
                    setContextMenu(null);
                    e.preventDefault();
                    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
                    const id = startLineTool('double-arrow', x, y);
                    toolDragRef.current = { id, tool: 'double-arrow', startX: x, startY: y, pointerId: e.pointerId };
                    return;
                  }
                  if (currentTool === 'curve') {
                    setContextMenu(null);
                    e.preventDefault();
                    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
                    const id = startLineTool('curve', x, y);
                    toolDragRef.current = { id, tool: 'curve', startX: x, startY: y, pointerId: e.pointerId };
                    return;
                  }
                  if (currentTool === 'draw') {
                    setContextMenu(null);
                    e.preventDefault();
                    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
                    const id = startDrawTool(x, y);
                    toolDragRef.current = { id, tool: 'draw', startX: x, startY: y, pointerId: e.pointerId };
                    return;
                  }

                  // Formes (Plus ? Formes): drag pour dimensionner
                  if (
                    [
                      'rectangle',
                      'circle',
                      'triangle',
                      'hexagon',
                      'pentagon',
                      'star',
                      'cloud',
                    ].includes(currentTool)
                  ) {
                    setContextMenu(null);
                    e.preventDefault();
                    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
                    const id = startBoxShapeTool(currentTool as any, x, y);
                    toolDragRef.current = { id, tool: currentTool as any, startX: x, startY: y, pointerId: e.pointerId };
                    return;
                  }
                  } catch (err) {
                    console.error('Erreur onPointerDown canvas:', err);
                  }
                }}
                onPointerMove={(e) => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;

                  // Déplacement / redimensionnement de l'élément saisi : traité ici
                  // AUSSI, car le canvas a capturé le pointeur (`setPointerCapture`)
                  // et l'événement `mousemove` global peut ne plus remonter — le
                  // glissement ne suivait alors plus la souris après le dépôt.
                  const elementDrag = dragRef.current;
                  if (elementDrag?.isDragging) {
                    const rect = canvas.getBoundingClientRect();
                    const cx = e.clientX - rect.left;
                    const cy = e.clientY - rect.top;

                    if (elementDrag.mode === 'resize') {
                      applyResize(elementDrag, cx, cy);
                    } else {
                      updateAnnotationLive(elementDrag.id, {
                        x: cx - elementDrag.offsetX,
                        y: cy - elementDrag.offsetY,
                      } as any);
                    }
                    return;
                  }

                  const drag = toolDragRef.current;
                  if (!drag || drag.pointerId !== e.pointerId) {
                    // Aucun geste en cours : retour visuel au survol (halo sur la
                    // poignée + curseur de redimensionnement ou de déplacement).
                    const hoverRect = canvas.getBoundingClientRect();
                    updateHoverFeedback(e.clientX - hoverRect.left, e.clientY - hoverRect.top);
                    return;
                  }

                  const rect = canvas.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  if (
                    drag.tool === 'highlight' ||
                    drag.tool === 'erase' ||
                    drag.tool === 'redact' ||
                    drag.tool === 'rectangle' ||
                    drag.tool === 'circle' ||
                    drag.tool === 'triangle' ||
                    drag.tool === 'hexagon' ||
                    drag.tool === 'pentagon' ||
                    drag.tool === 'star' ||
                    drag.tool === 'cloud'
                  ) {
                    const w = x - drag.startX;
                    const h = y - drag.startY;
                    updateAnnotationLive(drag.id, {
                      x: Math.min(drag.startX, x),
                      y: Math.min(drag.startY, y),
                      width: Math.abs(w),
                      height: Math.abs(h),
                    } as any);
                    return;
                  }
                  if (drag.tool === 'arrow' || drag.tool === 'double-arrow' || drag.tool === 'curve') {
                    updateAnnotationLive(drag.id, { x2: x, y2: y } as any);
                    return;
                  }
                  if (drag.tool === 'draw') {
                    setAnnotationsLive((prev) =>
                      prev.map((a) => {
                        if (a.id !== drag.id || a.type !== 'draw') return a;
                        return { ...a, points: [...a.points, { x, y }] };
                      })
                    );
                  }
                }}
                onPointerUp={(e) => {
                  // Fin du deplacement / redimensionnement d'un element.
                  // On termine le geste ici aussi : avec la capture du pointeur,
                  // l'evenement mouseup au niveau de document peut ne jamais arriver,
                  // et le glissement ne se liberait donc pas.
                  if (dragRef.current?.isDragging) {
                    dragRef.current = null;
                    setAlignmentGuides(null);
                    commitAnnotations(annotationsRef.current);
                  }

                  const drag = toolDragRef.current;
                  if (!drag || drag.pointerId !== e.pointerId) return;
                  toolDragRef.current = null;
                  // La forme qui vient d'etre dessinee devient selectionnee :
                  // le contour, les poignees et les options apparaissent aussitot.
                  setSelectedAnnotationId(drag.id);
                  // Outil à usage unique : après le dépôt, retour à la sélection
                  // (sinon chaque nouveau clic dessinait une forme de plus).
                  setCurrentTool('select');
                  // Commit final state (une seule entr�e historique)
                  commitAnnotations(annotationsRef.current);
                  // Apr�s une action "drag tool", on ferme la toolbar si elle �tait ouverte
                  setContextMenu(null);
                }}
                onLostPointerCapture={() => {
                  // Filet de securite supplementaire : la capture du pointeur est
                  // relachee a la fin du geste, ou si le navigateur l'interrompt
                  // (changement d'onglet, sortie de fenetre, appui long...).
                  // Sans cela, un element pouvait rester colle au curseur.
                  if (dragRef.current?.isDragging) {
                    dragRef.current = null;
                    setAlignmentGuides(null);
                    commitAnnotations(annotationsRef.current);
                  }
                }}
                onClick={(e) => {
                  // Fallback: certains navigateurs/overlays peuvent bloquer onPointerDown
                  // Ne jamais refermer le panneau de saisie en cours : ce clic suit
                  // immédiatement le pointerdown qui vient de l'ouvrir.
                  if (editingTextId) return;
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const x = (e as any).clientX - rect.left;
                  const y = (e as any).clientY - rect.top;
                  // M�me r�gle que pointerdown
                  if (shouldShowToolbarForTool(currentTool)) {
                    setContextMenu({ pageX: (e as any).clientX, pageY: (e as any).clientY, canvasX: x, canvasY: y });
                  } else {
                    setContextMenu(null);
                  }
                }}
                onDoubleClick={(e) => {
                  // Double-clic sur un texte : (re)ouvre la saisie. C'est le geste
                  // naturel pour corriger un texte déjà posé.
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const hit = hitTestAnnotation(e.clientX - rect.left, e.clientY - rect.top);
                  if (hit) openTextEditor(hit);
                }}
                onWheel={(e) => {
                  // Redimensionnement au scroll de l'élément sélectionné (texte/symbole)
                  if (!selectedAnnotationId) return;
                  const selected = annotations.find((a) => a.id === selectedAnnotationId) as any;
                  if (!selected || (selected.type !== 'text' && selected.type !== 'symbol')) return;

                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Scroll haut (deltaY négatif) = agrandir, Scroll bas (deltaY positif) = réduire
                  const step = e.shiftKey ? 3 : 1;
                  const currentSize = selected.fontSize || 16;
                  const newSize = e.deltaY < 0 
                    ? Math.min(72, currentSize + step)  // Scroll haut = agrandir
                    : Math.max(8, currentSize - step);   // Scroll bas = réduire
                  
                  updateSelected({ fontSize: newSize } as any);
                }}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  cursor: currentTool !== 'select' ? 'crosshair' : 'default',
                  touchAction: 'none', // important pour pointer events sur mobile/trackpad
                }}
              />

              {/* Barre d'actions de l'élément sélectionné : rend visible ce que
                  l'on peut faire (éditer un texte, agrandir/réduire, supprimer),
                  au lieu de ne montrer que les poignées. */}
              {selectedAnnotationId && (() => {
                const selected = annotations.find(
                  (a) => a.id === selectedAnnotationId && (a as any).page === currentPage
                ) as any;
                if (!selected) return null;

                return (
                  <div
                    data-pdf-canvas-area
                    className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white border border-border rounded-xl shadow-lg px-2 py-1.5 flex items-center gap-1"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {selected.type === 'text' && (
                      <button
                        type="button"
                        onClick={() => openTextEditor(selected)}
                        className="px-2.5 py-1.5 text-sm font-medium rounded-lg hover:bg-muted"
                        title="Modifier le texte"
                      >
                        Modifier le texte
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => scaleSelectedAnnotation(0.85)}
                      className="px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted"
                      title="Réduire"
                    >
                      Réduire
                    </button>
                    <button
                      type="button"
                      onClick={() => scaleSelectedAnnotation(1.15)}
                      className="px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted"
                      title="Agrandir"
                    >
                      Agrandir
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAnnotation(selected.id)}
                      className="px-2.5 py-1.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
                      title="Supprimer"
                    >
                      Supprimer
                    </button>
                  </div>
                );
              })()}

              {/* Guides d'alignement lors du d�placement */}
              {alignmentGuides && canvasRef.current && (
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  width={canvasRef.current.width}
                  height={canvasRef.current.height}
                  style={{ zIndex: 15 }}
                >
                  {alignmentGuides.x !== undefined && (
                    <line
                      x1={alignmentGuides.x}
                      y1={0}
                      x2={alignmentGuides.x}
                      y2={canvasRef.current.height}
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                    />
                  )}
                  {alignmentGuides.y !== undefined && (
                    <line
                      x1={0}
                      y1={alignmentGuides.y}
                      x2={canvasRef.current.width}
                      y2={alignmentGuides.y}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                    />
                  )}
                </svg>
              )}

              {/* Marqueur visuel (debug UX): montre o� tu as cliqu� */}
              {contextMenu && (
                <div
                  className="absolute w-3 h-3 rounded-full bg-blue-600 shadow-md"
                  style={{
                    left: contextMenu.canvasX - 6,
                    top: contextMenu.canvasY - 6,
                    zIndex: 20,
                  }}
                />
              )}

              {/* Édition inline du texte */}
              {contextMenu && editingTextId && selectedAnnotationId === editingTextId && (
                <div
                  data-text-editor
                  className="absolute bg-white border-2 border-primary rounded-lg shadow-xl p-4"
                  onPointerDown={(e) => {
                    // Empêcher la propagation pour ne pas fermer la zone de texte
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    left: 10,
                    right: 10,
                    top: contextMenu.canvasY + 10,
                    zIndex: 50,
                  }}
                >
                  <textarea
                    autoFocus
                    value={textDraft}
                    onChange={(ev) => setTextDraft(ev.target.value)}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onPaste={(ev) => {
                      // Appliquer le word wrap automatique sur le texte collé
                      const pastedText = ev.clipboardData.getData('text');
                      if (pastedText.length > 50 && !pastedText.includes('\n')) {
                        ev.preventDefault();
                        const canvas = canvasRef.current;
                        if (canvas) {
                          const maxWidth = canvas.width * 0.7;
                          const selected = annotations.find((a) => a.id === editingTextId) as any;
                          const fontSize = selected?.fontSize || defaultStyle.fontSize;
                          const wrappedText = wrapText(pastedText, maxWidth, fontSize);
                          // Remplacer le texte complet (ou ajouter à la fin si il y a déjà du texte)
                          const newText = textDraft ? textDraft + wrappedText : wrappedText;
                          setTextDraft(newText);
                        } else {
                          setTextDraft(textDraft + pastedText);
                        }
                      }
                    }}
                    onKeyDown={(ev) => {
                      // Ctrl+Enter ou Alt+Enter pour valider
                      if (ev.key === 'Enter' && (ev.ctrlKey || ev.altKey)) {
                        ev.preventDefault();
                        commitTextDraft();
                        return;
                      }
                      // Enter simple = retour à la ligne (comportement par défaut)
                      if (ev.key === 'Escape') {
                        ev.preventDefault();
                        setEditingTextId(null);
                      }
                    }}
                    placeholder="Tapez votre texte..."
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-md text-base outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[120px]"
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    Enter pour nouvelle ligne • Ctrl+Enter pour valider • Échap pour annuler
                  </div>
                </div>
              )}

              {/* Barre d'outils contextuelle désactivée - remplacée par barre fixe à gauche */}
              {false && contextMenu && contextMenu.showToolbar !== false && (
                <div
                  data-pdf-context-toolbar
                  className="absolute z-40 bg-white border border-border rounded-xl shadow-xl px-3 py-2 flex items-center gap-2"
                  onPointerDown={(e) => {
                    // IMPORTANT: �viter que le clic sur la barre d�clenche le handler du canvas
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    // Position relative au canvas - toujours en dessous du clic
                    left: Math.max(12, Math.min(contextMenu.canvasX - 170, (canvasRef.current?.width || 800) - 352)),
                    top: contextMenu.canvasY + 60,
                    width: 340,
                  }}
                >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        insertTextAt(contextMenu.canvasX, contextMenu.canvasY);
                      }}
                      className="px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                      title="Ajouter du texte"
                    >
                      <Type className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            insertTextAt(contextMenu.canvasX, contextMenu.canvasY, { text, openEditor: true });
                          }
                        } catch (err) {
                          console.error('Impossible de lire le presse-papier:', err);
                        }
                      }}
                      className="px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                      title="Coller"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-1">
                      {['✓', '✗', '★', '♥', '⚠', 'ℹ', '→', '$', '€', '%', '#'].map((sym) => (
                        <button
                          key={sym}
                          onClick={(e) => {
                            e.stopPropagation();
                            insertSymbolAt(contextMenu.canvasX, contextMenu.canvasY, sym);
                          }}
                          className="px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-semibold"
                          title={`Ins�rer ${sym}`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>

                    <div className="h-6 w-px bg-border mx-1" />

                    <input
                      type="color"
                      value={
                        (selectedAnnotationId
                          ? (annotations.find((a) => a.id === selectedAnnotationId) as any)?.color
                          : defaultStyle.color) || '#111827'
                      }
                      onChange={(ev) => {
                        const c = ev.target.value;
                        if (selectedAnnotationId) updateSelected({ color: c } as any);
                        else setDefaultStyle((s) => ({ ...s, color: c }));
                      }}
                      className="w-10 h-10 p-1 rounded-lg border border-border"
                      title="Couleur"
                    />

                    <select
                      className="h-10 px-2 rounded-lg border border-border text-sm"
                      value={
                        selectedAnnotationId
                          ? ((annotations.find((a) => a.id === selectedAnnotationId) as any)?.fontSize ?? defaultStyle.fontSize)
                          : defaultStyle.fontSize
                      }
                      onChange={(ev) => {
                        const v = parseInt(ev.target.value, 10);
                        if (selectedAnnotationId) updateSelected({ fontSize: v } as any);
                        else setDefaultStyle((s) => ({ ...s, fontSize: v }));
                      }}
                      title="Taille"
                    >
                      {[12, 14, 16, 18, 20, 24, 28, 32].map((n) => (
                        <option key={n} value={n}>
                          {n}px
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedAnnotationId) {
                          const cur = annotations.find((a) => a.id === selectedAnnotationId) as any;
                          updateSelected({ bold: !cur?.bold } as any);
                        } else {
                          setDefaultStyle((s) => ({ ...s, bold: !s.bold }));
                        }
                      }}
                      className="px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                      title="Gras"
                    >
                      <Bold className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedAnnotationId) {
                          const cur = annotations.find((a) => a.id === selectedAnnotationId) as any;
                          updateSelected({ italic: !cur?.italic } as any);
                        } else {
                          setDefaultStyle((s) => ({ ...s, italic: !s.italic }));
                        }
                      }}
                      className="px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                      title="Italique"
                    >
                      <Italic className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedAnnotationId) {
                          const cur = annotations.find((a) => a.id === selectedAnnotationId) as any;
                          updateSelected({ underline: !cur?.underline } as any);
                        } else {
                          setDefaultStyle((s) => ({ ...s, underline: !s.underline }));
                        }
                      }}
                      className="px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                      title="Souligner"
                    >
                      <Underline className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedAnnotationId) deleteSelected();
                      }}
                      disabled={!selectedAnnotationId}
                      className="px-2 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Supprimer l��l�ment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeContextMenu();
                      }}
                      className="px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                </div>
              )}

              {/* Option insertion en bas de page */}
              {/* -bottom-25 : suffisamment d'écart avec la barre de navigation
                  ci-dessous, sinon le bouton semble collé au bouton « Page suivante ». */}
              <div className="absolute -bottom-[6.5rem] left-1/2 transform -translate-x-1/2">
                <button
                  onClick={handleInsertPagesClick}
                  className="flex items-center gap-2 px-4 py-2 bg-background border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors shadow"
                  title="Insérer une ou plusieurs pages"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Insérer la page ici</span>
                </button>
              </div>

              {/* Contr�les de navigation/zoom int�gr�s en bas du PDF */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 flex items-center space-x-4 shadow-lg">
                {/* Navigation pages */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newPage = Math.max(1, currentPage - 1);
                      setCurrentPage(newPage);
                    }}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Page pr�c�dente"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {currentPage}/{pdfPages.length}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = Math.min(pdfPages.length, currentPage + 1);
                      setCurrentPage(newPage);
                    }}
                    disabled={currentPage === pdfPages.length}
                    className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Page suivante"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Contr�les de zoom */}
                <div className="flex items-center space-x-2 border-l border-border pl-4">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 rounded hover:bg-muted"
                    title="Zoom arri�re"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium min-w-[50px] text-center">
                    {zoom}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 rounded hover:bg-muted"
                    title="Zoom avant"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomFit}
                    className="px-2 py-1 text-xs rounded hover:bg-muted border border-border"
                    title="Ajuster � la page"
                  >
                    Fit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
