/**
 * Tests unitaires du cartouche d'informations affiché au-dessus du QR code.
 *
 * Lancement : `npm test`
 * (compilation via tsconfig.test.json puis exécution avec le lanceur natif Node)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { describeQr, isShortlink, mapLink, qrFileSlug, truncateMiddle } from '../src/lib/qr';

test('describeQr : URL classique -> domaine en titre, chemin en sous-titre', () => {
  const description = describeQr('url', {
    url: 'https://www.exemple.com/produits/ete-2026?ref=qr',
  });

  assert.ok(description);
  assert.equal(description.kind, 'link');
  assert.equal(description.title, 'exemple.com');
  assert.equal(description.subtitle, '/produits/ete-2026?ref=qr');
  assert.equal(description.fallback, 'https://www.exemple.com/produits/ete-2026?ref=qr');
  assert.equal(description.href, 'https://www.exemple.com/produits/ete-2026?ref=qr');
  assert.equal(description.warning, undefined);
});

test('describeQr : URL sans schéma acceptée, racine sans sous-titre', () => {
  const description = describeQr('url', { url: 'exemple.com' });

  assert.ok(description);
  assert.equal(description.title, 'exemple.com');
  assert.equal(description.subtitle, undefined);
  assert.equal(description.warning, undefined);
});

test('describeQr : lien raccourci signalé (destination masquée)', () => {
  const description = describeQr('url', { url: 'https://bit.ly/3xYz' });

  assert.ok(description);
  assert.equal(description.title, 'bit.ly');
  assert.equal(description.warning, 'shortlink');
});

test('describeQr : chemin long coupé au milieu sans perdre la fin', () => {
  const path = '/actualites/2026/01/10/un-titre-tres-long-a-tronquer';
  const description = describeQr('url', { url: `https://exemple.com${path}` });

  assert.ok(description);
  assert.ok(description.subtitle);
  assert.ok(description.subtitle.length <= 44);
  assert.ok(description.subtitle.includes('…'));
  assert.ok(description.subtitle.endsWith('a-tronquer'));
});

test('describeQr : formulaire incomplet -> aucun cartouche', () => {
  assert.equal(describeQr('url', {}), null);
  assert.equal(describeQr('url', { url: '   ' }), null);
  assert.equal(describeQr('wifi', { encryption: 'WPA' }), null);
  assert.equal(describeQr('vcard', { phone: '+33 6 12 34 56 78' }), null);
  assert.equal(describeQr('email', { subject: 'Devis' }), null);
  assert.equal(describeQr('geo', { latitude: '48.8566' }), null);
});

test('describeQr : WiFi chiffré -> mot de passe disponible mais à masquer', () => {
  const description = describeQr('wifi', {
    ssid: 'Cafe-Invites',
    password: 'cafe2026',
    encryption: 'WPA',
  });

  assert.ok(description);
  assert.equal(description.kind, 'wifi');
  assert.equal(description.title, 'Cafe-Invites');
  assert.equal(description.security, 'wpa');
  assert.equal(description.secret, 'cafe2026');
  assert.equal(description.warning, undefined);
});

test('describeQr : réseau ouvert -> avertissement et aucun secret', () => {
  const description = describeQr('wifi', { ssid: 'Libre', encryption: 'nopass' });

  assert.ok(description);
  assert.equal(description.security, 'nopass');
  assert.equal(description.secret, undefined);
  assert.equal(description.warning, 'open-network');
});

test('describeQr : vCard -> nom complet, poste, entreprise et numéro', () => {
  const description = describeQr('vcard', {
    firstName: 'Marie',
    lastName: 'Dupont',
    organization: 'Acme',
    title: 'CTO',
    phone: '+33 6 12 34 56 78',
  });

  assert.ok(description);
  assert.equal(description.kind, 'contact');
  assert.equal(description.title, 'Marie Dupont');
  assert.equal(description.subtitle, 'CTO · Acme');
  assert.equal(description.fallback, '+33 6 12 34 56 78');
  assert.equal(description.href, 'tel:+33612345678');
});

test('describeQr : vCard sans nom -> entreprise en titre', () => {
  const description = describeQr('vcard', { organization: 'Acme', firstName: 'Marie' });

  assert.ok(description);
  assert.equal(description.title, 'Marie');
  assert.equal(description.subtitle, 'Acme');

  const company = describeQr('vcard', { organization: 'Acme', title: 'CTO' });

  assert.ok(company);
  assert.equal(company.title, 'Acme');
  assert.equal(company.subtitle, 'CTO');
});

test('describeQr : email -> adresse en titre, objet en sous-titre', () => {
  const description = describeQr('email', {
    email: 'contact@exemple.com',
    subject: 'Demande de devis',
  });

  assert.ok(description);
  assert.equal(description.kind, 'email');
  assert.equal(description.title, 'contact@exemple.com');
  assert.equal(description.subtitle, 'Demande de devis');
  assert.equal(description.fallback, 'contact@exemple.com');
  assert.equal(description.href, 'mailto:contact@exemple.com');
});

test('describeQr : téléphone et SMS -> numéro nettoyé dans le lien', () => {
  const call = describeQr('phone', { phone: '+33 6 12 34 56 78' });
  assert.ok(call);
  assert.equal(call.kind, 'call');
  assert.equal(call.title, '+33 6 12 34 56 78');
  assert.equal(call.fallback, '+33 6 12 34 56 78');
  assert.equal(call.href, 'tel:+33612345678');

  const sms = describeQr('sms', { phone: '+33 6 12 34 56 78', message: 'Bonjour' });
  assert.ok(sms);
  assert.equal(sms.kind, 'sms');
  assert.equal(sms.subtitle, 'Bonjour');
  assert.equal(sms.href, 'sms:+33612345678');
});

test('describeQr : GPS -> lien de carte, coordonnées invalides signalées', () => {
  const valid = describeQr('geo', { latitude: '48.8566', longitude: '2.3522' });

  assert.ok(valid);
  assert.equal(valid.kind, 'map');
  assert.equal(valid.title, '48.8566, 2.3522');
  assert.equal(valid.fallback, mapLink('48.8566', '2.3522'));
  assert.equal(valid.href, mapLink('48.8566', '2.3522'));
  assert.equal(valid.warning, undefined);

  const invalid = describeQr('geo', { latitude: '999', longitude: '2.3522' });

  assert.ok(invalid);
  assert.equal(invalid.warning, 'invalid');
  assert.equal(invalid.href, undefined);
});

test('isShortlink : domaines connus, sous-domaines et domaines légitimes', () => {
  assert.equal(isShortlink('bit.ly'), true);
  assert.equal(isShortlink('www.tinyurl.com'), true);
  assert.equal(isShortlink('l.exemple.bit.ly'), true);
  assert.equal(isShortlink('exemple.com'), false);
  assert.equal(isShortlink(''), false);
});

test('truncateMiddle : conserve le début et la fin', () => {
  assert.equal(truncateMiddle('court', 10), 'court');
  assert.equal(truncateMiddle('  espaces   multiples  ', 40), 'espaces multiples');

  const cut = truncateMiddle('abcdefghijklmnopqrstuvwxyz', 10);

  assert.equal(cut.length, 10);
  assert.ok(cut.startsWith('abc'));
  assert.ok(cut.endsWith('xyz'));
});

test('qrFileSlug : nom de fichier sûr et lisible', () => {
  assert.equal(qrFileSlug({ kind: 'link', title: 'exemple.com' }), 'exemple-com');
  assert.equal(qrFileSlug({ kind: 'wifi', title: 'Café Invités' }), 'cafe-invites');
  assert.equal(qrFileSlug({ kind: 'call', title: '+33 6 12 34 56 78' }), '33-6-12-34-56-78');
  assert.equal(qrFileSlug(null), 'qr');
});

