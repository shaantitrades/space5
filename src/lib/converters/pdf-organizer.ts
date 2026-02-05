/**
 * Multi Convert - PDF Organizer
 * Réorganisation, insertion et gestion des pages PDF
 */

import { PDFDocument } from 'pdf-lib';

export interface PageMove {
  sourceIndex: number;
  targetIndex: number;
}

export interface PageInsert {
  sourceBuffer: Buffer; // PDF source pour extraire la page
  sourcePageIndex?: number; // Page spécifique à insérer (optionnel)
  targetIndex: number; // Position dans le PDF cible
}

export interface OrganizeOptions {
  removePages?: number[]; // Indices des pages à supprimer
  reorder?: PageMove[]; // Réorganiser les pages
  insertPages?: PageInsert[]; // Insérer des pages d'autres PDF
  duplicatePage?: { sourceIndex: number; targetIndex?: number }; // Dupliquer une page
}

export class PDFOrganizer {
  /**
   * Réorganise les pages d'un PDF : suppression, réordonnancement, insertion
   */
  static async organize(
    pdfBuffer: Buffer,
    options: OrganizeOptions
  ): Promise<Buffer> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Le buffer PDF est vide ou invalide');
      }

      const sourcePdf = await PDFDocument.load(pdfBuffer);
      const totalPages = sourcePdf.getPageCount();

      if (totalPages === 0) {
        throw new Error('Le PDF source ne contient aucune page');
      }

      // Créer un nouveau PDF
      const newPdf = await PDFDocument.create();
      const pagesToKeep: number[] = [];

      // Étape 1: Déterminer les pages à garder (en excluant celles à supprimer)
      if (options.removePages && options.removePages.length > 0) {
        const removeSet = new Set(
          options.removePages
            .map((p) => (p < 0 ? totalPages + p : p)) // Support des indices négatifs
            .filter((p) => p >= 0 && p < totalPages)
        );

        for (let i = 0; i < totalPages; i++) {
          if (!removeSet.has(i)) {
            pagesToKeep.push(i);
          }
        }

        if (pagesToKeep.length === 0) {
          throw new Error('Impossible de supprimer toutes les pages');
        }
      } else {
        // Garder toutes les pages si aucune suppression
        pagesToKeep.push(...Array.from({ length: totalPages }, (_, i) => i));
      }

      // Étape 2: Réordonner les pages si demandé
      let orderedPages = [...pagesToKeep];
      if (options.reorder && options.reorder.length > 0) {
        orderedPages = this.applyReordering(orderedPages, options.reorder);
      }

      // Étape 3: Dupliquer une page si demandé
      if (options.duplicatePage) {
        const sourceIdx = options.duplicatePage.sourceIndex;
        if (sourceIdx >= 0 && sourceIdx < orderedPages.length) {
          const targetIdx = options.duplicatePage.targetIndex ?? orderedPages.length;
          orderedPages.splice(targetIdx, 0, orderedPages[sourceIdx]);
        }
      }

      // Étape 4: Copier les pages ordonnées dans le nouveau PDF
      let currentIndex = 0;
      for (let i = 0; i < orderedPages.length; i++) {
        // Vérifier s'il faut insérer des pages à cette position
        if (options.insertPages) {
          const insertsAtThisIndex = options.insertPages
            .filter((ins) => ins.targetIndex === currentIndex)
            .sort((a, b) => (a.targetIndex ?? 0) - (b.targetIndex ?? 0));

          for (const insert of insertsAtThisIndex) {
            try {
              const sourcePdfDoc = await PDFDocument.load(insert.sourceBuffer);
              const sourcePageCount = sourcePdfDoc.getPageCount();

              if (sourcePageCount === 0) {
                console.warn('PDF source vide pour insertion, ignoré');
                continue;
              }

              // Insérer une page spécifique ou toutes les pages
              if (insert.sourcePageIndex !== undefined) {
                if (insert.sourcePageIndex >= 0 && insert.sourcePageIndex < sourcePageCount) {
                  const [copiedPage] = await newPdf.copyPages(
                    sourcePdfDoc,
                    [insert.sourcePageIndex]
                  );
                  newPdf.addPage(copiedPage);
                  currentIndex++;
                }
              } else {
                // Insérer toutes les pages du PDF source
                const copiedPages = await newPdf.copyPages(
                  sourcePdfDoc,
                  sourcePdfDoc.getPageIndices()
                );
                copiedPages.forEach((page) => newPdf.addPage(page));
                currentIndex += copiedPages.length;
              }
            } catch (error) {
              console.error('Erreur lors de l\'insertion d\'une page:', error);
              // Continuer avec les autres insertions
            }
          }
        }

        // Ajouter la page du PDF original
        const pageIndex = orderedPages[i];
        if (pageIndex >= 0 && pageIndex < totalPages) {
          try {
            const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
            newPdf.addPage(copiedPage);
            currentIndex++;
          } catch (error) {
            console.error(`Erreur copie page ${pageIndex}:`, error);
            // Continuer avec les autres pages
          }
        }
      }

      // Gérer les insertions après la dernière page
      if (options.insertPages) {
        const insertsAtEnd = options.insertPages.filter(
          (ins) => ins.targetIndex >= currentIndex || ins.targetIndex === undefined
        );

        for (const insert of insertsAtEnd) {
          try {
            const sourcePdfDoc = await PDFDocument.load(insert.sourceBuffer);
            const sourcePageCount = sourcePdfDoc.getPageCount();

            if (insert.sourcePageIndex !== undefined) {
              if (insert.sourcePageIndex >= 0 && insert.sourcePageIndex < sourcePageCount) {
                const [copiedPage] = await newPdf.copyPages(
                  sourcePdfDoc,
                  [insert.sourcePageIndex]
                );
                newPdf.addPage(copiedPage);
              }
            } else {
              const copiedPages = await newPdf.copyPages(
                sourcePdfDoc,
                sourcePdfDoc.getPageIndices()
              );
              copiedPages.forEach((page) => newPdf.addPage(page));
            }
          } catch (error) {
            console.error('Erreur insertion finale:', error);
          }
        }
      }

      // Métadonnées
      newPdf.setProducer('Multi Convert PDF Organizer');
      newPdf.setCreator('Multi Convert');
      newPdf.setCreationDate(new Date());

      const pdfBytes = await newPdf.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('Erreur organisation PDF:', error);
      throw new Error(
        error instanceof Error
          ? `Échec de l'organisation: ${error.message}`
          : 'Échec de l\'organisation'
      );
    }
  }

  /**
   * Applique un réordonnancement de pages
   */
  private static applyReordering(
    pages: number[],
    moves: PageMove[]
  ): number[] {
    const result = [...pages];

    // Valider et appliquer chaque déplacement
    for (const move of moves) {
      if (
        move.sourceIndex >= 0 &&
        move.sourceIndex < result.length &&
        move.targetIndex >= 0 &&
        move.targetIndex <= result.length
      ) {
        const [movedPage] = result.splice(move.sourceIndex, 1);
        result.splice(move.targetIndex, 0, movedPage);
      }
    }

    return result;
  }

  /**
   * Supprime des pages spécifiées
   */
  static async removePages(
    pdfBuffer: Buffer,
    pageIndices: number[]
  ): Promise<Buffer> {
    return this.organize(pdfBuffer, {
      removePages: pageIndices,
    });
  }

  /**
   * Réordonne les pages selon une nouvelle séquence
   */
  static async reorderPages(
    pdfBuffer: Buffer,
    newOrder: number[] // Nouvel ordre des indices de pages (0-indexed)
  ): Promise<Buffer> {
    const sourcePdf = await PDFDocument.load(pdfBuffer);
    const totalPages = sourcePdf.getPageCount();

    // Valider le nouvel ordre
    const validOrder = newOrder.filter(
      (idx) => idx >= 0 && idx < totalPages
    );

    if (validOrder.length !== totalPages) {
      throw new Error('L\'ordre spécifié ne contient pas toutes les pages');
    }

    // Créer un nouveau PDF avec les pages dans le nouvel ordre
    const newPdf = await PDFDocument.create();

    for (const pageIndex of validOrder) {
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
      newPdf.addPage(copiedPage);
    }

    newPdf.setProducer('Multi Convert PDF Organizer');
    newPdf.setCreator('Multi Convert');

    const pdfBytes = await newPdf.save();
    return Buffer.from(pdfBytes);
  }
}
