/**
 * Selectionne automatiquement un element des qu'il est ajoute.
 *
 * Sans cela, apres avoir ajoute un texte, une forme ou une image,
 * l'element n'etait pas selectionne : ni contour, ni poignees, ni
 * options. L'utilisateur devait deviner qu'il fallait cliquer dessus.
 *
 * Usage : node scripts/_select-on-add.mjs
 */
import fs from 'node:fs';

const FILE = 'src/components/editors/pdf-editor.tsx';
let src = fs.readFileSync(FILE, 'utf8');
const EOL = src.includes('\r\n') ? '\r\n' : '\n';

let insertions = 0;

/**
 * Ajoute une ligne apres chaque ligne correspondant au motif,
 * en conservant l'indentation d'origine.
 */
function insertAfter(pattern, added) {
  const lines = src.split(EOL);
  const next = [];
  let count = 0;

  for (const line of lines) {
    next.push(line);
    if (pattern.test(line)) {
      const indent = line.match(/^\s*/)?.[0] ?? '';
      next.push(`${indent}${added}`);
      count++;
    }
  }

  src = next.join(EOL);
  insertions += count;
  console.log(`  ${count} insertion(s) pour : ${added}`);
}

// 1. Ajout par commit (texte, symboles, images...)
insertAfter(
  /commitAnnotations\(\[\.\.\.annotationsRef\.current, ann\]\);\s*$/,
  'setSelectedAnnotationId(ann.id);'
);

// 2. Ajout en direct (le ref est mis a jour immediatement)
insertAfter(
  /setAnnotationsLive\(\(prev\) => \[\.\.\.prev, ann\]\);\s*$/,
  'setSelectedAnnotationId(ann.id);'
);

// 3. Fin du trace d'une forme : on selectionne ce qui vient d'etre dessine
const TOOL_UP = `                  const drag = toolDragRef.current;
                  if (!drag || drag.pointerId !== e.pointerId) return;
                  toolDragRef.current = null;`;

const TOOL_UP_FIXED = `                  const drag = toolDragRef.current;
                  if (!drag || drag.pointerId !== e.pointerId) return;
                  toolDragRef.current = null;
                  // La forme qui vient d'etre dessinee devient selectionnee :
                  // le contour, les poignees et les options apparaissent aussitot.
                  setSelectedAnnotationId(drag.id);`;

const toolUpCount = src.split(TOOL_UP).length - 1;

if (toolUpCount === 1) {
  src = src.replace(TOOL_UP, TOOL_UP_FIXED);
  insertions++;
  console.log("  selection apres le trace d'une forme");
} else {
  console.error(`  ATTENTION : bloc de fin de trace trouve ${toolUpCount} fois (attendu 1)`);
}

if (insertions === 0) {
  console.error('\nAucune modification - fichier NON ecrit.');
  process.exit(1);
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`\n${insertions} modification(s) appliquee(s).`);
