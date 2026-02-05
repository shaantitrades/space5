import { 
  FileText, Combine, Scissors, Minimize2, FileSearch,
  Edit, PenTool, PenLine, ShieldX, Lock, Unlock, Droplet,
  Layers, RotateCw, Crop, Trash, ImagePlus, Sparkles, Zap,
  Star, Maximize2, Video, Music, Volume2, Film, Archive,
  Grid3x3, FileX, Cloud, Link2, Plus, LayoutGrid
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: 'transformation' | 'assemblage' | 'authentification' | 'conversion' | 'optimisation' | 'personnalisation' | 'production' | 'reparation';
  color: string;
  bgColor: string;
  popular?: boolean;
  pro?: boolean;
  new?: boolean;
}

export const toolsConfig: Tool[] = [
  // ===== TRANSFORMATION RAPIDE =====
  {
    id: 'pdf-edit',
    name: 'Modifier & Annoter',
    description: 'Personnalisez vos documents avec modifications et annotations',
    icon: Edit,
    href: '/pdf?tool=edit',
    category: 'transformation',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    popular: true,
  },
  {
    id: 'pdf-create',
    name: 'Créer PDF',
    description: 'Rédiger un PDF professionnel depuis une page vierge (A4/Lettre) et exporter',
    icon: Plus,
    href: '/pdf?tool=create',
    category: 'transformation',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    pro: true,
  },
  {
    id: 'pdf-convert',
    name: 'Convertir Format',
    description: 'Transformer entre PDF, Word, Excel, Images et plus',
    icon: FileText,
    href: '/pdf?tool=convert',
    category: 'transformation',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    popular: true,
  },
  {
    id: 'img-favicon',
    name: 'Image to ICO',
    description: 'Convertir vos images (PNG, JPG) en fichiers ICO pour favicons',
    icon: Star,
    href: '/images?tool=favicon',
    category: 'transformation',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    popular: true,
  },
  {
    id: 'pdf-compress',
    name: 'Optimiser Taille',
    description: 'Réduire la taille de vos fichiers sans perte de qualité visible',
    icon: Minimize2,
    href: '/pdf?tool=compress',
    category: 'transformation',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'pdf-split',
    name: 'Extraire Contenu',
    description: 'Obtenir un nouveau document avec seulement les pages souhaitées',
    icon: Scissors,
    href: '/pdf?tool=split',
    category: 'transformation',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'pdf-organize',
    name: 'Reorganiser Pages',
    description: 'Gérez la structure de vos documents en réarrangeant les pages',
    icon: Layers,
    href: '/pdf?tool=organize',
    category: 'transformation',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    id: 'img-filters',
    name: 'Appliquer Filtres',
    description: 'Ajouter des effets visuels et transformations créatives',
    icon: Sparkles,
    href: '/images?tool=filters',
    category: 'transformation',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },

  // ===== ASSEMBLAGE & DÉCOUPAGE =====
  {
    id: 'pdf-merge',
    name: 'Fusionner Documents',
    description: 'Assemblez plusieurs PDF et images en un document unique',
    icon: Combine,
    href: '/pdf?tool=merge',
    category: 'assemblage',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'pdf-split-multi',
    name: 'Scinder PDF',
    description: 'Séparez votre PDF en plusieurs fichiers distincts selon vos besoins',
    icon: Scissors,
    href: '/pdf?tool=split',
    category: 'assemblage',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'pdf-extract-sections',
    name: 'Extraire par Sections',
    description: 'Extraire chapitres basés sur les signets de la table des matières',
    icon: FileX,
    href: '/pdf?tool=extract-sections',
    category: 'assemblage',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    id: 'pdf-shuffle',
    name: 'Mélanger Pages',
    description: 'Alterner et mélanger les pages de plusieurs documents',
    icon: Grid3x3,
    href: '/pdf?tool=shuffle',
    category: 'assemblage',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    id: 'pdf-add-pages',
    name: 'Ajouter Pages',
    description: 'Insérer des pages supplémentaires dans votre document PDF',
    icon: Plus,
    href: '/pdf?tool=add-pages',
    category: 'assemblage',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
  },

  // ===== AUTHENTIFICATION & PROTECTION =====
  {
    id: 'pdf-sign',
    name: 'Finaliser & Valider',
    description: 'Remplir des formulaires PDF et apposer vos signatures électroniques',
    icon: PenLine,
    href: '/pdf?tool=sign',
    category: 'authentification',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    popular: true,
  },
  {
    id: 'pdf-protect',
    name: 'Sécuriser Document',
    description: 'Protégez vos fichiers sensibles avec des mots de passe robustes',
    icon: Lock,
    href: '/pdf?tool=protect',
    category: 'authentification',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'pdf-unlock',
    name: 'Accéder Protégé',
    description: 'Retirez les restrictions d\'accès selon vos besoins légitimes',
    icon: Unlock,
    href: '/pdf?tool=unlock',
    category: 'authentification',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'pdf-watermark',
    name: 'Marquer Fichier',
    description: 'Marquez vos documents avec des filigranes textuels ou graphiques',
    icon: Droplet,
    href: '/pdf?tool=watermark',
    category: 'authentification',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },

  // ===== CONVERSION INTELLIGENTE =====
  {
    id: 'doc-to-pdf',
    name: 'Documents → PDF',
    description: 'Créer un document PDF à partir de Word, Excel, PPT',
    icon: FileText,
    href: '/convert?from=doc&to=pdf',
    category: 'conversion',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'img-to-pdf',
    name: 'Images → PDF',
    description: 'Convertir images JPG, PNG, HEIC vers PDF',
    icon: ImagePlus,
    href: '/convert?from=image&to=pdf',
    category: 'conversion',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'pdf-to-office',
    name: 'PDF → Office',
    description: 'Transformer PDF vers Word, Excel, PowerPoint',
    icon: FileText,
    href: '/convert?from=pdf&to=office',
    category: 'conversion',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'media-convert',
    name: 'Media → Formats',
    description: 'Conversion vidéo et audio entre multiples formats',
    icon: Video,
    href: '/media?tool=convert',
    category: 'conversion',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'text-to-pdf',
    name: 'Texte → PDF',
    description: 'Convertir pages web HTML ou fichiers texte vers PDF',
    icon: FileText,
    href: '/convert?from=text&to=pdf',
    category: 'conversion',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF → Images',
    description: 'Convertir pages PDF vers JPG, PNG, TIFF',
    icon: ImagePlus,
    href: '/convert?from=pdf&to=image',
    category: 'conversion',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },

  // ===== OPTIMISATION & QUALITÉ =====
  {
    id: 'reduce-size',
    name: 'Réduire Poids',
    description: 'Optimiser la taille de vos fichiers pour un partage plus rapide',
    icon: Minimize2,
    href: '/pdf?tool=compress',
    category: 'optimisation',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'pdf-ocr',
    name: 'Reconnaissance Texte',
    description: 'Extraire le texte de documents scannés avec précision',
    icon: FileSearch,
    href: '/pdf?tool=ocr',
    category: 'optimisation',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'auto-rotate',
    name: 'Corriger Orientation',
    description: 'Redresser automatiquement les pages PDF numérisées inclinées',
    icon: RotateCw,
    href: '/pdf?tool=auto-rotate',
    category: 'optimisation',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    new: true,
  },
  {
    id: 'color-transform',
    name: 'Transformer Couleurs',
    description: 'Convertir un PDF en niveau de gris ou ajuster les couleurs',
    icon: Sparkles,
    href: '/pdf?tool=color-transform',
    category: 'optimisation',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    id: 'clean-annotations',
    name: 'Nettoyer Annotations',
    description: 'Suppression en lot des surlignages et annotations d\'un PDF',
    icon: Trash,
    href: '/pdf?tool=clean-annotations',
    category: 'optimisation',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },

  // ===== PERSONNALISATION AVANCÉE =====
  {
    id: 'create-forms',
    name: 'Créer Formulaires',
    description: 'Créateur de formulaires PDF gratuit. Rendre les documents remplissables',
    icon: LayoutGrid,
    href: '/pdf?tool=create-forms',
    category: 'personnalisation',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    new: true,
  },
  {
    id: 'manage-bookmarks',
    name: 'Gérer Signets',
    description: 'Créer et organiser les signets PDF pour navigation facilitée',
    icon: Link2,
    href: '/pdf?tool=bookmarks',
    category: 'personnalisation',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'add-headers',
    name: 'Ajouter En-têtes',
    description: 'Appliquer numéros de pages et étiquettes au fichier PDF',
    icon: FileText,
    href: '/pdf?tool=headers',
    category: 'personnalisation',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'page-numbers',
    name: 'Numérotation Automatique',
    description: 'Ajouter des numéros de page au PDF automatiquement',
    icon: Grid3x3,
    href: '/pdf?tool=page-numbers',
    category: 'personnalisation',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    id: 'edit-metadata',
    name: 'Éditer Informations',
    description: 'Changer auteur, titre, mots-clés et métadonnées du PDF',
    icon: Edit,
    href: '/pdf?tool=metadata',
    category: 'personnalisation',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    id: 'extract-images',
    name: 'Extraire Visuels',
    description: 'Extraire toutes les images depuis un fichier PDF',
    icon: ImagePlus,
    href: '/pdf?tool=extract-images',
    category: 'personnalisation',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'crop-pages',
    name: 'Ajuster Dimensions',
    description: 'Rogner les marges et changer la taille de la page PDF',
    icon: Crop,
    href: '/pdf?tool=crop',
    category: 'personnalisation',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
  },
  {
    id: 'rotate-pages',
    name: 'Orienter Pages',
    description: 'Pivoter et sauvegarder les pages PDF de façon permanente',
    icon: RotateCw,
    href: '/pdf?tool=rotate',
    category: 'personnalisation',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },

  // ===== PRODUCTION & IMPRESSION =====
  {
    id: 'nup-layout',
    name: 'Mise en Page Multiple',
    description: 'Imprimer plusieurs pages par feuille de papier (N-up)',
    icon: Grid3x3,
    href: '/pdf?tool=nup',
    category: 'production',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    new: true,
  },
  {
    id: 'bates-numbering',
    name: 'Numérotation Bates',
    description: 'Numérotation automatique sur plusieurs fichiers en même temps',
    icon: FileText,
    href: '/pdf?tool=bates',
    category: 'production',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    pro: true,
  },
  {
    id: 'flatten',
    name: 'Aplatir Document',
    description: 'Rendre les PDF remplissables en lecture seule. Imprimer en une étape',
    icon: Layers,
    href: '/pdf?tool=flatten',
    category: 'production',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'print-prep',
    name: 'Préparer Impression',
    description: 'Combiner plusieurs actions pour préparer un PDF à l\'impression',
    icon: FileText,
    href: '/pdf?tool=print-prep',
    category: 'production',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },

  // ===== RÉPARATION & RÉCUPÉRATION =====
  {
    id: 'repair-pdf',
    name: 'Restaurer Fichier',
    description: 'Récupérer des données corrompues ou endommagées d\'un document PDF',
    icon: Cloud,
    href: '/pdf?tool=repair',
    category: 'reparation',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    pro: true,
  },
  {
    id: 'smart-rename',
    name: 'Renommer Intelligent',
    description: 'Changer le nom de fichier basé sur le texte des pages PDF',
    icon: FileText,
    href: '/pdf?tool=smart-rename',
    category: 'reparation',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'optimize-structure',
    name: 'Améliorer Structure',
    description: 'Optimiser et améliorer la structure interne d\'un document PDF',
    icon: Layers,
    href: '/pdf?tool=optimize-structure',
    category: 'reparation',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
];

// Helper functions
export const getToolById = (id: string): Tool | undefined => {
  return toolsConfig.find(tool => tool.id === id);
};

export const getToolsByCategory = (category: Tool['category']): Tool[] => {
  return toolsConfig.filter(tool => tool.category === category);
};

export const getPopularTools = (): Tool[] => {
  return toolsConfig.filter(tool => tool.popular);
};

export const getProTools = (): Tool[] => {
  return toolsConfig.filter(tool => tool.pro);
};

export const getNewTools = (): Tool[] => {
  return toolsConfig.filter(tool => tool.new);
};

export const categoryLabels: Record<Tool['category'], string> = {
  transformation: 'Transformation Rapide',
  assemblage: 'Assemblage & Découpage',
  authentification: 'Authentification & Protection',
  conversion: 'Conversion Intelligente',
  optimisation: 'Optimisation & Qualité',
  personnalisation: 'Personnalisation Avancée',
  production: 'Production & Impression',
  reparation: 'Réparation & Récupération',
};
