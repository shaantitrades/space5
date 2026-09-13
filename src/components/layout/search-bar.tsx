'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Search, X, Command, FileText, Image as ImageIcon, Video, File, Zap, TrendingUp, Clock, ArrowRight, Star, PenLine, Edit, PenTool, ShieldX, Lock, Unlock, Droplet, Layers, RotateCw, Crop, Trash, Sparkles, Minimize2, Film, Music, Volume2, Scissors, Combine, FileSearch, Maximize2 } from 'lucide-react';

/** Entree statique de l'index : les libelles viennent du catalogue i18n */
interface SearchItem {
  id: string;
  category: 'tool' | 'page' | 'feature';
  href: string;
  icon: React.ElementType;
  keywords: string[];
}

interface SearchResult extends SearchItem {
  title: string;
  description: string;
}

/** Outils mis en avant quand le champ est vide (ids du catalogue) */
const SUGGESTED_IDS = ['pdf-convert', 'pdf-merge', 'pdf-compress', 'pdf-fill-sign'];

const searchableItems: SearchItem[] = [
  // Pages principales
  { id: 'pdf', category: 'page', href: '/pdf', icon: FileText, keywords: ['pdf', 'document', 'conversion', 'ocr', 'fusion', 'compression'] },
  { id: 'images', category: 'page', href: '/images', icon: ImageIcon, keywords: ['image', 'photo', 'logo', 'optimisation', 'filtre', 'resize'] },
  { id: 'media', category: 'page', href: '/media', icon: Video, keywords: ['video', 'audio', 'mp4', 'mp3', 'conversion', 'extraction'] },
  { id: 'archive', category: 'page', href: '/archive', icon: File, keywords: ['zip', 'archive', 'compresser', 'extraire', 'décompresser'] },
  
  // Outils PDF
  { id: 'pdf-convert', category: 'tool', href: '/pdf?tool=convert', icon: FileText, keywords: ['pdf', 'convertir', 'word', 'excel', 'jpg', 'png', 'conversion'] },
  { id: 'pdf-ocr', category: 'tool', href: '/pdf?tool=ocr', icon: FileSearch, keywords: ['ocr', 'texte', 'reconnaissance', 'scanner', 'reconnaissance de texte', 'extraire texte'] },
  { id: 'pdf-merge', category: 'tool', href: '/pdf?tool=merge', icon: Combine, keywords: ['fusionner', 'combiner', 'merge', 'unir', 'assembler'] },
  { id: 'pdf-split', category: 'tool', href: '/pdf?tool=split', icon: Scissors, keywords: ['diviser', 'séparer', 'split', 'couper', 'scinder', 'extraire', 'séparer pdf'] },
  { id: 'pdf-compress', category: 'tool', href: '/pdf?tool=compress', icon: Minimize2, keywords: ['compresser', 'réduire', 'compress', 'taille', 'diminuer', 'réduire pdf'] },
  { id: 'pdf-edit', category: 'tool', href: '/pdf?tool=edit', icon: Edit, keywords: ['éditeur', 'edit', 'modifier', 'personnaliser', 'éditeur pdf', 'modifier pdf'] },
  { id: 'pdf-annotate', category: 'tool', href: '/pdf?tool=annotate', icon: PenTool, keywords: ['annoter', 'notes', 'surlignage', 'dessins', 'annotation', 'commenter'] },
  { id: 'pdf-fill-sign', category: 'tool', href: '/pdf?tool=sign', icon: PenLine, keywords: ['remplir', 'signer', 'signature', 'formulaire', 'form', 'fill', 'sign', 'électronique', 'remplir et signer', 'remplissage', 'validation', 'signer pdf', 'formulaire pdf'] },
  { id: 'pdf-redact', category: 'tool', href: '/pdf?tool=redact', icon: ShieldX, keywords: ['protéger', 'masquer', 'confidentiel', 'redact', 'caviarder', 'protection données', 'masquer informations'] },
  { id: 'pdf-protect', category: 'tool', href: '/pdf?tool=protect', icon: Lock, keywords: ['sécuriser', 'protéger', 'mot de passe', 'password', 'sécurité', 'sécurisation', 'protéger pdf'] },
  { id: 'pdf-unlock', category: 'tool', href: '/pdf?tool=unlock', icon: Unlock, keywords: ['déverrouiller', 'unlock', 'retirer restrictions', 'débloquer', 'déverrouiller pdf', 'enlever mot de passe', 'débloquer pdf'] },
  { id: 'pdf-watermark', category: 'tool', href: '/pdf?tool=watermark', icon: Droplet, keywords: ['filigrane', 'watermark', 'marquer', 'filigrane personnalisé', 'marque document'] },
  { id: 'pdf-organize', category: 'tool', href: '/pdf?tool=organize', icon: Layers, keywords: ['réorganiser', 'organiser', 'pages', 'réarranger', 'structure', 'réorganisation'] },
  { id: 'pdf-rotate', category: 'tool', href: '/pdf?tool=rotate', icon: RotateCw, keywords: ['pivoter', 'rotate', 'rotation', 'orientation', 'portrait', 'paysage', 'tourner'] },
  { id: 'pdf-crop', category: 'tool', href: '/pdf?tool=crop', icon: Crop, keywords: ['recadrer', 'crop', 'découper', 'dimensions', 'redimensionner', 'ajuster'] },
  { id: 'pdf-delete-pages', category: 'tool', href: '/pdf?tool=delete-pages', icon: Trash, keywords: ['supprimer', 'delete', 'retirer', 'pages', 'enlever', 'effacer pages'] },
  
  // Outils Images
  { id: 'img-convert', category: 'tool', href: '/images?tool=convert', icon: ImageIcon, keywords: ['convertir', 'jpg', 'png', 'webp', 'svg', 'avif', 'gif', 'conversion images'] },
  { id: 'img-optimize', category: 'tool', href: '/images?tool=optimize', icon: Zap, keywords: ['optimiser', 'optimize', 'réduire', 'qualité', 'compression', 'compression intelligente'] },
  { id: 'img-resize', category: 'tool', href: '/images?tool=resize', icon: Maximize2, keywords: ['redimensionner', 'resize', 'taille', 'dimensions', 'crop', 'rotate', 'flip'] },
  { id: 'img-filters', category: 'tool', href: '/images?tool=filters', icon: Sparkles, keywords: ['filtres', 'filters', 'grayscale', 'sepia', 'blur', 'sharpen', 'effets'] },
  { id: 'img-watermark', category: 'tool', href: '/images?tool=watermark', icon: Droplet, keywords: ['filigrane', 'watermark', 'texte', 'logo', 'marquer image'] },
  { id: 'img-batch', category: 'tool', href: '/images?tool=batch', icon: Scissors, keywords: ['batch', 'lot', 'multiple', 'plusieurs', 'traitement par lot', 'plusieurs images'] },
  { id: 'img-favicon', category: 'tool', href: '/images?tool=favicon', icon: Star, keywords: ['favicon', 'icône', 'icon', 'icone', 'favicons', 'générateur', 'créer', 'apple-touch-icon', 'android-chrome'] },
  
  // Outils Media
  { id: 'media-video-convert', category: 'tool', href: '/media?tool=video-convert', icon: Video, keywords: ['convertir', 'vidéo', 'video', 'mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'conversion vidéo'] },
  { id: 'media-audio-convert', category: 'tool', href: '/media?tool=audio-convert', icon: Music, keywords: ['convertir', 'audio', 'mp3', 'wav', 'flac', 'aac', 'ogg', 'conversion audio'] },
  { id: 'media-extract-audio', category: 'tool', href: '/media?tool=extract-audio', icon: Volume2, keywords: ['extraire', 'audio', 'extract', 'sound', 'extraire audio vidéo', 'extraction audio'] },
  { id: 'media-trim', category: 'tool', href: '/media?tool=trim', icon: Scissors, keywords: ['découper', 'trim', 'couper', 'découper vidéo', 'couper audio', 'découpage'] },
  { id: 'media-compress', category: 'tool', href: '/media?tool=compress', icon: Minimize2, keywords: ['compresser', 'compress', 'réduire', 'taille', 'compression vidéo', 'compression audio'] },
  { id: 'media-merge', category: 'tool', href: '/media?tool=merge', icon: Film, keywords: ['fusionner', 'merge', 'combiner', 'fusionner vidéo', 'fusionner audio', 'combiner fichiers'] },
  
  // Fonctionnalités
  { id: 'batch', category: 'feature', href: '/pdf', icon: Zap, keywords: ['batch', 'lot', 'multiple', 'plusieurs'] },
  { id: 'api', category: 'feature', href: '/api', icon: TrendingUp, keywords: ['api', 'développeur', 'intégration', 'developer'] },
];

/** Normalise une chaîne (minuscules + suppression des accents) pour la recherche */
const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function SearchBar({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations('search');
  const tc = useTranslations('catalog');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Index localise : titre et description resolus dans la langue active
  const items: SearchResult[] = searchableItems.map((item) => ({
    ...item,
    title: tc(`items.${item.id}.title`),
    description: tc(`items.${item.id}.description`),
  }));
  const suggestions = SUGGESTED_IDS.map((id) => tc(`items.${id}.title`));

  // Charger les recherches récentes depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent<Document>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, [isOpen]);

  // Recherche instantanée
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const searchTerm = normalizeText(query.trim());
    // Tous les mots saisis doivent etre presents (recherche multi-mots)
    const terms = searchTerm.split(/\s+/).filter(Boolean);
    const filtered = items.filter((item) => {
      const searchableText = normalizeText(`${item.title} ${item.description} ${item.keywords.join(' ')}`);
      return terms.every((term) => searchableText.includes(term));
    });

    // Trier par pertinence (titre > description > mots-clés)
    const scored = filtered.map((item) => {
      let score = 0;
      const titleLower = normalizeText(item.title);
      const descLower = normalizeText(item.description);

      if (titleLower.startsWith(searchTerm)) score += 100;
      if (titleLower.includes(searchTerm)) score += 50;
      if (descLower.includes(searchTerm)) score += 25;
      item.keywords.forEach((keyword) => {
        if (normalizeText(keyword).includes(searchTerm)) score += 10;
      });

      return { item, score };
    });

    const sorted = scored.sort((a, b) => b.score - a.score).map((s) => s.item);
    setResults(sorted.slice(0, 8)); // Limiter à 8 résultats
    setSelectedIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `items` est reconstruit a chaque rendu
  }, [query, locale]);

  // Fermer quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (result: SearchResult) => {
    // Sauvegarder la recherche récente
    const updated = [result.title, ...recentSearches.filter((s) => s !== result.title)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    setIsOpen(false);
    setQuery('');
    router.push(result.href);
  };

  const handleDeleteRecentSearch = (e: React.MouseEvent, searchToDelete: string) => {
    e.stopPropagation(); // Empêcher le clic sur le bouton parent
    const updated = recentSearches.filter((s) => s !== searchToDelete);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const getCategoryLabel = (category: SearchResult['category']) => t(`categories.${category}`);

  return (
    <div ref={searchBarRef} className={embedded ? 'relative' : 'relative bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'}>
      <div className={embedded ? '' : 'container mx-auto px-4 py-3'}>
        <div className={embedded ? 'mx-auto max-w-2xl' : 'max-w-3xl mx-auto'}>
          <div className="relative">
            {/* Champ de recherche */}
            <div
              onClick={() => setIsOpen(true)}
              className={`relative flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all cursor-text ${
                isOpen
                  ? 'border-primary shadow-lg bg-background'
                  : 'border-border hover:border-primary/50 bg-muted/30'
              }`}
            >
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              {!isOpen && (
                <div className="hidden md:flex items-center space-x-1 px-2 py-1 rounded border border-border bg-background">
                  <Command className="w-3 h-3" />
                  <kbd className="text-xs font-mono">K</kbd>
                </div>
              )}
            </div>

            {/* Dropdown de résultats */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-border rounded-lg shadow-xl z-[9999] max-h-[500px] overflow-hidden">
                {query.trim().length === 0 ? (
                  // Aucune recherche - Afficher les recherches récentes et suggestions
                  <div className="p-4">
                    {recentSearches.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-muted-foreground uppercase">
                          <Clock className="w-3 h-3" />
                          <span>{t('recent')}</span>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((search, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setQuery(search);
                                inputRef.current?.focus();
                              }}
                              className="w-full text-left px-3 py-2 rounded hover:bg-muted text-sm flex items-center justify-between group"
                            >
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{search}</span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteRecentSearch(e, search)}
                                className="p-1 rounded hover:bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title={t('deleteRecent')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-muted-foreground uppercase">
                        <TrendingUp className="w-3 h-3" />
                        <span>{t('popular')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setQuery(suggestion);
                              inputRef.current?.focus();
                            }}
                            className="text-left px-3 py-2 rounded hover:bg-muted text-sm border border-border"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  // Aucun résultat
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{t('noResults', { query })}</p>
                  </div>
                ) : (
                  // Résultats
                  <div className="overflow-y-auto max-h-[450px]">
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full text-left px-4 py-3 flex items-start space-x-3 transition-colors ${
                            index === selectedIndex ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm">{result.title}</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                {getCategoryLabel(result.category)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                        </button>
                      );
                    })}
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
