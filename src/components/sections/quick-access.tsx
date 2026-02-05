'use client';

import { 
  FileText, Image, Video, ArrowRight,
  Edit, RotateCw, Minimize2, FileSearch, Scissors, Combine,
  PenTool, PenLine, Lock, Unlock, ShieldX, Droplet,
  Layers, Crop, Trash, Bookmark, FileCheck, Settings,
  Download, Upload, FilePlus, ImageIcon, AlignCenter,
  Type, Hash, Palette, Eraser, RefreshCw, Wrench,
  FileX, Info, Grid3x3
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Tool {
  icon: any;
  title: string;
  description: string;
  link: string;
  badge?: 'populaire' | 'nouveau' | 'pro';
  category?: string;
}

export function QuickAccess() {
  // 3 cartes principales (gardées telles quelles)
  const mainFeatures: Tool[] = [
    {
      icon: FileText,
      title: 'PDF & Documents',
      description: 'Conversion, OCR, Fusion, Compression de tous vos documents',
      link: '/pdf',
      badge: 'populaire',
    },
    {
      icon: Image,
      title: 'Images & Logos',
      description: '20+ formats, optimisation intelligente et redimensionnement',
      link: '/images',
      badge: 'populaire',
    },
    {
      icon: Video,
      title: 'Vidéo & Audio',
      description: 'Batch processing, codecs multiples, qualité optimale',
      link: '/media',
      badge: 'populaire',
    },
  ];

  // Groupe 1 : Transformation Rapide (7 outils)
  const transformationTools: Tool[] = [
    {
      icon: Edit,
      title: 'Modifier & Annoter',
      description: 'Personnalisez vos documents avec modifications et annotations',
      link: '/convert?tool=edit&input=PDF',
      badge: 'populaire',
    },
    {
      icon: FilePlus,
      title: 'Créer PDF',
      description: 'Rédiger un PDF professionnel depuis une page vierge (A4/Lettre) et exporter',
      link: '/convert?tool=create-pdf&input=PDF',
      badge: 'pro',
    },
    {
      icon: RotateCw,
      title: 'Convertir Format',
      description: 'Transformer entre PDF, Word, Excel, Images et plus',
      link: '/convert?tool=convert',
      badge: 'populaire',
    },
    {
      icon: ImageIcon,
      title: 'Image to ICO',
      description: 'Convertir vos images (PNG, JPG) en fichiers ICO pour favicons',
      link: '/convert?input=IMAGE&output=ICO',
      badge: 'populaire',
    },
    {
      icon: Minimize2,
      title: 'Optimiser Taille',
      description: 'Réduire la taille de vos fichiers sans perte de qualité visible',
      link: '/convert?tool=compress&input=PDF',
    },
    {
      icon: FileSearch,
      title: 'Extraire Contenu',
      description: 'Obtenir un nouveau document avec seulement les pages souhaitées',
      link: '/convert?tool=extract&input=PDF',
    },
    {
      icon: Layers,
      title: 'Reorganiser Pages',
      description: 'Gérez la structure de vos documents en réarrangeant les pages',
      link: '/convert?tool=organize&input=PDF',
    },
    {
      icon: Palette,
      title: 'Appliquer Filtres',
      description: 'Ajouter des effets visuels et transformations créatives',
      link: '/convert?tool=filters&input=IMAGE',
    },
  ];

  // Groupe 2 : Assemblage & Découpage (5 outils)
  const assemblyTools: Tool[] = [
    {
      icon: Combine,
      title: 'Fusionner Documents',
      description: 'Assemblez plusieurs PDF et images en un document unique',
      link: '/convert?tool=merge&input=PDF',
    },
    {
      icon: Scissors,
      title: 'Scinder PDF',
      description: 'Séparez votre PDF en plusieurs fichiers distincts selon vos besoins',
      link: '/convert?tool=split&input=PDF',
    },
    {
      icon: Bookmark,
      title: 'Extraire par Sections',
      description: 'Extraire chapitres basés sur les signets de la table des matières',
      link: '/convert?tool=extract-sections&input=PDF',
    },
    {
      icon: RefreshCw,
      title: 'Mélanger Pages',
      description: 'Alterner et mélanger les pages de plusieurs documents',
      link: '/convert?tool=mix-pages&input=PDF',
    },
    {
      icon: FilePlus,
      title: 'Ajouter Pages',
      description: 'Insérer des pages supplémentaires dans votre document PDF',
      link: '/convert?tool=add-pages&input=PDF',
    },
  ];

  // Groupe 3 : Authentification & Protection (4 outils)
  const securityTools: Tool[] = [
    {
      icon: PenLine,
      title: 'Finaliser & Valider',
      description: 'Remplir des formulaires PDF et apposer vos signatures électroniques',
      link: '/convert?tool=sign&input=PDF',
      badge: 'populaire',
    },
    {
      icon: Lock,
      title: 'Sécuriser Document',
      description: 'Protégez vos fichiers sensibles avec des mots de passe robustes',
      link: '/convert?tool=protect&input=PDF',
    },
    {
      icon: Unlock,
      title: 'Accéder Protégé',
      description: 'Retirez les restrictions d\'accès selon vos besoins légitimes',
      link: '/convert?tool=unlock&input=PDF',
    },
    {
      icon: Droplet,
      title: 'Marquer Fichier',
      description: 'Marquez vos documents avec des filigranes textuels ou graphiques',
      link: '/convert?tool=watermark&input=PDF',
    },
  ];

  // Groupe 4 : Conversion Intelligente (6 outils)
  const conversionTools: Tool[] = [
    {
      icon: FileText,
      title: 'Documents → PDF',
      description: 'Créer un document PDF à partir de Word, Excel, PPT',
      link: '/convert?input=DOCUMENT&output=PDF',
    },
    {
      icon: ImageIcon,
      title: 'Images → PDF',
      description: 'Convertir images JPG, PNG, HEIC vers PDF',
      link: '/convert?input=IMAGE&output=PDF',
    },
    {
      icon: FileCheck,
      title: 'PDF → Office',
      description: 'Transformer PDF vers Word, Excel, PowerPoint',
      link: '/convert?input=PDF&output=WORD',
    },
    {
      icon: Video,
      title: 'Media → Formats',
      description: 'Conversion vidéo et audio entre multiples formats',
      link: '/convert?input=VIDEO&output=MP4',
    },
    {
      icon: Type,
      title: 'Texte → PDF',
      description: 'Convertir pages web HTML ou fichiers texte vers PDF',
      link: '/convert?input=TEXT&output=PDF',
    },
    {
      icon: Download,
      title: 'PDF → Images',
      description: 'Convertir pages PDF vers JPG, PNG, TIFF',
      link: '/convert?input=PDF&output=PNG',
    },
  ];

  // Groupe 5 : Optimisation & Qualité (5 outils)
  const optimizationTools: Tool[] = [
    {
      icon: Minimize2,
      title: 'Réduire Poids',
      description: 'Optimiser la taille de vos fichiers pour un partage plus rapide',
      link: '/convert?tool=compress&input=PDF',
    },
    {
      icon: FileSearch,
      title: 'Reconnaissance Texte',
      description: 'Extraire le texte de documents scannés avec précision',
      link: '/convert?tool=ocr&input=PDF',
    },
    {
      icon: AlignCenter,
      title: 'Corriger Orientation',
      description: 'Redresser automatiquement les pages PDF numérisées inclinées',
      link: '/convert?tool=straighten&input=PDF',
      badge: 'nouveau',
    },
    {
      icon: Palette,
      title: 'Transformer Couleurs',
      description: 'Convertir un PDF en niveau de gris ou ajuster les couleurs',
      link: '/convert?tool=grayscale&input=PDF',
    },
    {
      icon: Eraser,
      title: 'Nettoyer Annotations',
      description: 'Suppression en lot des surlignages et annotations d\'un PDF',
      link: '/convert?tool=clean-annotations&input=PDF',
    },
  ];

  // Groupe 6 : Personnalisation Avancée (8 outils)
  const personalizationTools: Tool[] = [
    {
      icon: FileCheck,
      title: 'Créer Formulaires',
      description: 'Créateur de formulaires PDF gratuit. Rendre les documents remplissables',
      link: '/convert?tool=create-form&input=PDF',
      badge: 'nouveau',
    },
    {
      icon: Bookmark,
      title: 'Gérer Signets',
      description: 'Créer et organiser les signets PDF pour navigation facilitée',
      link: '/convert?tool=bookmarks&input=PDF',
    },
    {
      icon: Type,
      title: 'Ajouter En-têtes',
      description: 'Appliquer numéros de pages et étiquettes au fichier PDF',
      link: '/convert?tool=headers&input=PDF',
    },
    {
      icon: Hash,
      title: 'Numérotation Automatique',
      description: 'Ajouter des numéros de page au PDF automatiquement',
      link: '/convert?tool=page-numbers&input=PDF',
    },
    {
      icon: Settings,
      title: 'Éditer Informations',
      description: 'Changer auteur, titre, mots-clés et métadonnées du PDF',
      link: '/convert?tool=metadata&input=PDF',
    },
    {
      icon: ImageIcon,
      title: 'Extraire Visuels',
      description: 'Extraire toutes les images depuis un fichier PDF',
      link: '/convert?tool=extract-images&input=PDF',
    },
    {
      icon: Crop,
      title: 'Ajuster Dimensions',
      description: 'Rogner les marges et changer la taille de la page PDF',
      link: '/convert?tool=crop&input=PDF',
    },
    {
      icon: RotateCw,
      title: 'Orienter Pages',
      description: 'Pivoter et sauvegarder les pages PDF de façon permanente',
      link: '/convert?tool=rotate&input=PDF',
    },
  ];

  // Groupe 7 : Production & Impression (4 outils)
  const productionTools: Tool[] = [
    {
      icon: Grid3x3,
      title: 'Mise en Page Multiple',
      description: 'Imprimer plusieurs pages par feuille de papier (N-up)',
      link: '/convert?tool=n-up&input=PDF',
      badge: 'nouveau',
    },
    {
      icon: Hash,
      title: 'Numérotation Bates',
      description: 'Numérotation automatique sur plusieurs fichiers en même temps',
      link: '/convert?tool=bates&input=PDF',
      badge: 'pro',
    },
    {
      icon: FileX,
      title: 'Aplatir Document',
      description: 'Rendre les PDF remplissables en lecture seule. Imprimer en une étape',
      link: '/convert?tool=flatten&input=PDF',
    },
    {
      icon: FileText,
      title: 'Préparer Impression',
      description: 'Combiner plusieurs actions pour préparer un PDF à l\'impression',
      link: '/convert?tool=prepare-print&input=PDF',
    },
  ];

  // Groupe 8 : Réparation & Récupération (3 outils)
  const repairTools: Tool[] = [
    {
      icon: Wrench,
      title: 'Restaurer Fichier',
      description: 'Récupérer des données corrompues ou endommagées d\'un document PDF',
      link: '/convert?tool=repair&input=PDF',
      badge: 'pro',
    },
    {
      icon: FileText,
      title: 'Renommer Intelligent',
      description: 'Changer le nom de fichier basé sur le texte des pages PDF',
      link: '/convert?tool=rename&input=PDF',
    },
    {
      icon: RefreshCw,
      title: 'Améliorer Structure',
      description: 'Optimiser et améliorer la structure interne d\'un document PDF',
      link: '/convert?tool=optimize-structure&input=PDF',
    },
  ];

  // Regrouper tous les outils par catégories
  const allToolGroups = [
    { name: 'Catégories Principales', tools: mainFeatures },
    { name: 'Transformation Rapide', tools: transformationTools },
    { name: 'Assemblage & Découpage', tools: assemblyTools },
    { name: 'Authentification & Protection', tools: securityTools },
    { name: 'Conversion Intelligente', tools: conversionTools },
    { name: 'Optimisation & Qualité', tools: optimizationTools },
    { name: 'Personnalisation Avancée', tools: personalizationTools },
    { name: 'Production & Impression', tools: productionTools },
    { name: 'Réparation & Récupération', tools: repairTools },
  ];

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'populaire':
        return 'bg-blue-500 text-white';
      case 'nouveau':
        return 'bg-green-500 text-white';
      case 'pro':
        return 'bg-purple-500 text-white';
      default:
        return '';
    }
  };

  const getBadgeText = (badge?: string) => {
    switch (badge) {
      case 'populaire':
        return 'Populaire';
      case 'nouveau':
        return 'Nouveau';
      case 'pro':
        return 'Pro';
      default:
        return '';
    }
  };

  return (
    <section className="py-8 bg-background border-b">
      <div className="container mx-auto px-4">
        {/* 3 Cartes principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                href={feature.link}
                className="group relative p-6 bg-card rounded-xl border border-border hover:border-primary/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {feature.badge && (
                  <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded ${getBadgeStyle(feature.badge)}`}>
                    {getBadgeText(feature.badge)}
                  </span>
                )}
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                  <span>Cliquez pour accéder</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Toutes les autres cartes organisées par groupes */}
        <div className="max-w-7xl mx-auto space-y-12">
          {allToolGroups.slice(1).map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-2xl font-bold mb-6 text-center md:text-left">
                {group.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={index}
                      href={tool.link}
                      className="group relative p-5 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    >
                      {tool.badge && (
                        <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getBadgeStyle(tool.badge)}`}>
                          {getBadgeText(tool.badge)}
                        </span>
                      )}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-base font-semibold mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
