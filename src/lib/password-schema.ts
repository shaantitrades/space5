/**
 * 🔐 SCHÉMA DE MOT DE PASSE PARTAGÉ - Multi Convert
 *
 * Règles uniques pour l'inscription et la réinitialisation : un mot de passe
 * accepté à la création doit l'être aussi lors d'un reset (et inversement).
 */

import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .max(128)
  .regex(/[A-Z]/, 'Minimum 1 majuscule')
  .regex(/[a-z]/, 'Minimum 1 minuscule')
  .regex(/[0-9]/, 'Minimum 1 chiffre')
  .regex(/[!@#$%^&*()_+=\[\]{};:'",.<>?\/\\|-]/, 'Minimum 1 caractère spécial');

/** Message d'aide affiché dans les formulaires (inscription / réinitialisation) */
export const PASSWORD_REQUIREMENTS =
  '8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial';
