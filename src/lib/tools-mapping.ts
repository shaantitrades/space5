/**
 * Mapping des outils vers leurs titres et descriptions
 * Utilisé pour afficher dynamiquement les infos d'outil dans Hero
 */

export interface ToolInfo {
  title: string;
  description: string;
}

export function getToolInfoFromParams(
  tool?: string | null,
  input?: string | null,
  output?: string | null
): ToolInfo | null {
  // Si aucun paramètre, retourner null (afficher Multi Convert par défaut)
  if (!tool && !input && !output) {
    return null;
  }

  // Mapping basé sur les paramètres URL
  const toolMap: Record<string, ToolInfo> = {
    // Conversions avec input/output
    'IMAGE:ICO': { title: 'Image to ICO', description: 'Convertir vos images (PNG, JPG) en fichiers ICO pour favicons' },
    'DOCUMENT:PDF': { title: 'Documents → PDF', description: 'Créer un document PDF à partir de Word, Excel, PPT' },
    'IMAGE:PDF': { title: 'Images → PDF', description: 'Convertir images JPG, PNG, HEIC vers PDF' },
    'PDF:WORD': { title: 'PDF → Office', description: 'Transformer PDF vers Word, Excel, PowerPoint' },
    'VIDEO:MP4': { title: 'Media → Formats', description: 'Conversion vidéo et audio entre multiples formats' },
    'TEXT:PDF': { title: 'Texte → PDF', description: 'Convertir pages web HTML ou fichiers texte vers PDF' },
    'PDF:PNG': { title: 'PDF → Images', description: 'Convertir pages PDF vers JPG, PNG, TIFF' },
    
    // Outils avec paramètre tool
    'edit:PDF': { title: 'Modifier & Annoter', description: 'Personnalisez vos documents avec modifications et annotations' },
    'create-pdf:PDF': { title: 'Créer PDF', description: 'Rédigez un PDF professionnel depuis une page vierge (A4/Lettre), ajoutez texte, images, formes et exportez' },
    'create-pdf': { title: 'Créer PDF', description: 'Rédigez un PDF professionnel depuis une page vierge (A4/Lettre), ajoutez texte, images, formes et exportez' },
    'compress:PDF': { title: 'Optimiser Taille', description: 'Réduire la taille de vos fichiers sans perte de qualité visible' },
    'compress': { title: 'Compresser PDF', description: 'Réduire la grosseur du PDF' },
    'extract:PDF': { title: 'Extraire Contenu', description: 'Obtenir un nouveau document avec seulement les pages souhaitées' },
    'organize:PDF': { title: 'Reorganiser Pages', description: 'Gérez la structure de vos documents en réarrangeant les pages' },
    'filters:IMAGE': { title: 'Appliquer Filtres', description: 'Ajouter des effets visuels et transformations créatives' },
    'merge:PDF': { title: 'Fusionner Documents', description: 'Assemblez plusieurs PDF et images en un document unique' },
    'split:PDF': { title: 'Scinder PDF', description: 'Séparez votre PDF en plusieurs fichiers distincts selon vos besoins' },
    'extract-sections:PDF': { title: 'Extraire par Sections', description: 'Extraire chapitres basés sur les signets de la table des matières' },
    'mix-pages:PDF': { title: 'Mélanger Pages', description: 'Alterner et mélanger les pages de plusieurs documents' },
    'add-pages:PDF': { title: 'Ajouter Pages', description: 'Insérer des pages supplémentaires dans votre document PDF' },
    'sign:PDF': { title: 'Finaliser & Valider', description: 'Remplir des formulaires PDF et apposer vos signatures électroniques' },
    'protect:PDF': { title: 'Sécuriser Document', description: 'Protégez vos fichiers sensibles avec des mots de passe robustes' },
    'unlock:PDF': { title: 'Accéder Protégé', description: 'Retirez les restrictions d\'accès selon vos besoins légitimes' },
    'watermark:PDF': { title: 'Marquer Fichier', description: 'Marquez vos documents avec des filigranes textuels ou graphiques' },
    'ocr:PDF': { title: 'Reconnaissance Texte', description: 'Extraire le texte de documents scannés avec précision' },
    'straighten:PDF': { title: 'Corriger Orientation', description: 'Redresser automatiquement les pages PDF numérisées inclinées' },
    'grayscale:PDF': { title: 'Transformer Couleurs', description: 'Convertir un PDF en niveau de gris ou ajuster les couleurs' },
    'clean-annotations:PDF': { title: 'Nettoyer Annotations', description: 'Suppression en lot des surlignages et annotations d\'un PDF' },
    'create-form:PDF': { title: 'Créer Formulaires', description: 'Créateur de formulaires PDF gratuit. Rendre les documents remplissables' },
    'bookmarks:PDF': { title: 'Gérer Signets', description: 'Créer et organiser les signets PDF pour navigation facilitée' },
    'headers:PDF': { title: 'Ajouter En-têtes', description: 'Appliquer numéros de pages et étiquettes au fichier PDF' },
    'page-numbers:PDF': { title: 'Numérotation Automatique', description: 'Ajouter des numéros de page au PDF automatiquement' },
    'metadata:PDF': { title: 'Éditer Informations', description: 'Changer auteur, titre, mots-clés et métadonnées du PDF' },
    'extract-images:PDF': { title: 'Extraire Visuels', description: 'Extraire toutes les images depuis un fichier PDF' },
    'crop:PDF': { title: 'Ajuster Dimensions', description: 'Rogner les marges et changer la taille de la page PDF' },
    'rotate:PDF': { title: 'Orienter Pages', description: 'Pivoter et sauvegarder les pages PDF de façon permanente' },
    'n-up:PDF': { title: 'Mise en Page Multiple', description: 'Imprimer plusieurs pages par feuille de papier (N-up)' },
    'bates:PDF': { title: 'Numérotation Bates', description: 'Numérotation automatique sur plusieurs fichiers en même temps' },
    'flatten:PDF': { title: 'Aplatir Document', description: 'Rendre les PDF remplissables en lecture seule. Imprimer en une étape' },
    'prepare-print:PDF': { title: 'Préparer Impression', description: 'Combiner plusieurs actions pour préparer un PDF à l\'impression' },
    'repair:PDF': { title: 'Restaurer Fichier', description: 'Récupérer des données corrompues ou endommagées d\'un document PDF' },
    'rename:PDF': { title: 'Renommer Intelligent', description: 'Changer le nom de fichier basé sur le texte des pages PDF' },
    'optimize-structure:PDF': { title: 'Améliorer Structure', description: 'Optimiser et améliorer la structure interne d\'un document PDF' },
  };

  // Chercher d'abord par input:output
  if (input && output) {
    const key = `${input.toUpperCase()}:${output.toUpperCase()}`;
    if (toolMap[key]) {
      return toolMap[key];
    }
  }

  // Chercher par tool:input
  if (tool && input) {
    const key = `${tool.toLowerCase()}:${input.toUpperCase()}`;
    if (toolMap[key]) {
      return toolMap[key];
    }
  }

  // Chercher par tool seul
  if (tool) {
    const key = tool.toLowerCase();
    if (toolMap[key]) {
      return toolMap[key];
    }
  }

  // Fallback par input seul (pour "convert" sans output spécifié)
  if (input && tool === 'convert') {
    return { title: 'Convertir Format', description: 'Transformer entre PDF, Word, Excel, Images et plus' };
  }

  return null;
}
