/**
 * Corrige le branchement du rendu de la selection dans l'editeur PDF.
 *
 * 1. Supprime la fonction `drawPage`, qui n'est JAMAIS appelee (code mort) :
 *    le rendu reel est fait par un useEffect plus haut dans le fichier.
 * 2. Ajoute le contour + les poignees de redimensionnement dans ce useEffect.
 * 3. Ajoute selectedAnnotationId / editingTextId aux dependances, sinon le
 *    canvas n'est pas redessine quand la selection change (les poignees
 *    n'apparaitraient jamais).
 *
 * Le fichier melange les encodages et utilise des fins de ligne CRLF :
 * les motifs sont donc sans accents et convertis vers le bon separateur.
 *
 * Usage : node scripts/_fix-editor-selection.mjs
 */
import fs from 'node:fs';

const FILE = 'src/components/editors/pdf-editor.tsx';
let src = fs.readFileSync(FILE, 'utf8');
let failures = 0;

/** Convertit les \n d'un motif vers le separateur de ligne reel du fichier */
const EOL = src.includes('\r\n') ? '\r\n' : '\n';
const withEol = (text) => text.split('\n').join(EOL);

// ---------------------------------------------------------------------------
// 1. Supprimer la fonction morte drawPage (ancres sans accents)
// ---------------------------------------------------------------------------
const DEAD_START = '  const drawPage = (pageCanvas: HTMLCanvasElement) => {';
const DEAD_END =
  '  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: EditorAnnotation) => {';

const startIndex = src.indexOf(DEAD_START);
const endIndex = src.indexOf(DEAD_END);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  failures++;
  console.error('ERREUR drawPage : bornes introuvables');
} else {
  src = src.slice(0, startIndex) + src.slice(endIndex);
  console.log('OK  fonction morte drawPage supprimee');
}

// ---------------------------------------------------------------------------
// 2. Overlay de selection dans le vrai useEffect + dependances completes
// ---------------------------------------------------------------------------
const LIVE_LOOP = withEol(`        // Dessiner les annotations
        annotations
          .filter((a) => (a as any).page === currentPage)
          .forEach((annotation) => {
            drawAnnotation(ctx, annotation);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfPages, currentPage, zoom, annotations]);`);

const LIVE_LOOP_FIXED = withEol(`        // Dessiner les annotations
        annotations
          .filter((a) => (a as any).page === currentPage)
          .forEach((annotation) => {
            drawAnnotation(ctx, annotation);
          });

        // Element selectionne : contour + poignees de redimensionnement.
        // Masque pendant l'edition inline du texte (le curseur doit rester lisible).
        if (selectedAnnotationId && editingTextId !== selectedAnnotationId) {
          const selected = annotations.find((a) => a.id === selectedAnnotationId);
          if (selected && (selected as any).page === currentPage) {
            drawSelectionOverlay(ctx, selected);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfPages, currentPage, zoom, annotations, selectedAnnotationId, editingTextId]);`);

const occurrences = src.split(LIVE_LOOP).length - 1;

if (occurrences !== 1) {
  failures++;
  console.error(`ERREUR useEffect de rendu : ${occurrences} occurrence(s) trouvee(s)`);
} else {
  src = src.replace(LIVE_LOOP, LIVE_LOOP_FIXED);
  console.log('OK  overlay de selection branche sur le vrai rendu (dependances completees)');
}

if (failures > 0) {
  console.error(`\n${failures} etape(s) en echec - fichier NON ecrit.`);
  process.exit(1);
}

fs.writeFileSync(FILE, src, 'utf8');
console.log('\nFichier ecrit.');
