/**
 * 🧪 Test de bout en bout — authentification & compte
 *
 * Vérifie DANS L'ORDRE tout le parcours :
 *   inscription → confirmation (avec ouverture de session) → /api/auth/me →
 *   profil → mot de passe → suspension → réactivation → export RGPD →
 *   suppression du compte (avec vérification de la cascade) → déconnexion.
 *
 * Prérequis : une base PostgreSQL JETABLE et le serveur démarré contre elle.
 *
 * 1) base jetable :
 *    docker run -d --name mc-test-pg -e POSTGRES_PASSWORD=test \
 *      -e POSTGRES_DB=multi_convert -p 55432:5432 postgres:16-alpine
 *
 * 2) schéma :
 *    DATABASE_URL=postgresql://postgres:test@127.0.0.1:55432/multi_convert \
 *    DIRECT_URL=$DATABASE_URL node ./node_modules/prisma/build/index.js db push
 *
 * 3) serveur (DEV_MODE désactivé, sinon Prisma est remplacé par un mock) :
 *    DEV_MODE=false SKIP_DB=false \
 *    DATABASE_URL=postgresql://postgres:test@127.0.0.1:55432/multi_convert \
 *    DIRECT_URL=$DATABASE_URL JWT_SECRET=… npm run dev -- -p 3114
 *
 * 4) test :
 *    node scripts/e2e-auth-test.mjs
 *
 * Variables d'environnement :
 *   TEST_BASE_URL      (défaut http://localhost:3114)
 *   TEST_DATABASE_URL  (défaut la base jetable ci-dessus)
 */
import pg from 'pg';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3114';
const DB = process.env.TEST_DATABASE_URL || 'postgresql://postgres:test@127.0.0.1:55432/multi_convert';
const EMAIL = `e2e-${Date.now()}@example.invalid`;
const PASSWORD = 'Valid1234!';
const NEW_PASSWORD = 'Nouveau1234!';

let pass = 0;
let fail = 0;

function check(label, ok, extra = '') {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}${extra ? '  |  ' + extra : ''}`);
}

const db = new pg.Client({ connectionString: DB });

async function api(method, path, { body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  const setCookie = res.headers.get('set-cookie') || '';
  const token = /auth-token=([^;]*)/.exec(setCookie)?.[1] || null;

  return {
    status: res.status,
    json,
    text,
    location: res.headers.get('location'),
    token,
    setCookie,
    headers: res.headers,
  };
}

(async () => {
  await db.connect();
  console.log(`\n=== TEST E2E AUTHENTIFICATION — ${EMAIL} ===\n`);

  // 1) Inscription
  let r = await api('POST', '/api/auth/signup', {
    body: { fullName: 'E2E Test', email: EMAIL, password: PASSWORD, acceptTerms: true, acceptMarketing: false },
  });
  check('1. inscription', r.status === 201 && r.json?.user?.email === EMAIL, `status=${r.status}`);

  // 2) Connexion refusée tant que l'email n'est pas confirmé
  r = await api('POST', '/api/auth/login', { body: { email: EMAIL, password: PASSWORD } });
  check('2. connexion bloquée avant confirmation', r.status === 403 && r.json?.requiresVerification === true, `status=${r.status}`);

  // 3) Jeton de confirmation en base (préfixe v1_)
  const { rows } = await db.query('SELECT id, reset_token FROM users WHERE email = $1', [EMAIL]);
  const token = rows[0]?.reset_token;
  check('3. jeton de confirmation en base', typeof token === 'string' && token.startsWith('v1_'), `token=${String(token).slice(0, 8)}…`);

  // 4) Clic sur le lien → session ouverte automatiquement
  r = await api('GET', `/api/auth/verify?token=${token}`);
  check('4. lien de confirmation → tableau de bord', r.status === 302 && r.location === '/dashboard?verified=1', `location=${r.location}`);
  check('4b. session ouverte automatiquement (cookie)', !!r.token);
  const cookie = `auth-token=${r.token}`;

  // 5) L'en-tête voit l'utilisateur
  r = await api('GET', '/api/auth/me', { cookie });
  check('5. /api/auth/me renvoie l utilisateur', r.status === 200 && r.json?.user?.email === EMAIL, `fullName=${r.json?.user?.fullName}`);
  check('5b. email marqué vérifié', !!r.json?.user?.emailVerified);

  // 6) Modification du profil
  r = await api('PATCH', '/api/auth/profile', { body: { name: 'E2E Renomme', acceptMarketing: true }, cookie });
  check('6. profil modifié', r.status === 200 && r.json?.user?.fullName === 'E2E Renomme', `status=${r.status}`);
  r = await api('GET', '/api/auth/me', { cookie });
  check('6b. nouveau nom relu par /me', r.json?.user?.fullName === 'E2E Renomme');

  // 7) Changement de mot de passe
  r = await api('POST', '/api/auth/change-password', { body: { currentPassword: 'Mauvais1!', newPassword: NEW_PASSWORD }, cookie });
  check('7. mauvais mot de passe actuel refusé', r.status === 400, `status=${r.status}`);
  r = await api('POST', '/api/auth/change-password', { body: { currentPassword: PASSWORD, newPassword: 'faible' }, cookie });
  check('7b. nouveau mot de passe faible refusé', r.status === 400, `status=${r.status}`);
  r = await api('POST', '/api/auth/change-password', { body: { currentPassword: PASSWORD, newPassword: NEW_PASSWORD }, cookie });
  check('7c. mot de passe changé', r.status === 200, `status=${r.status}`);

  // 8) Connexion avec le nouveau mot de passe
  r = await api('POST', '/api/auth/login', { body: { email: EMAIL, password: PASSWORD } });
  check('8. ancien mot de passe refusé', r.status === 401, `status=${r.status}`);
  r = await api('POST', '/api/auth/login', { body: { email: EMAIL, password: NEW_PASSWORD } });
  check('8b. connexion avec le nouveau mot de passe', r.status === 200 && !!r.token, `status=${r.status}`);

  // 9) Suspension temporaire
  r = await api('POST', '/api/auth/suspend', { body: { password: 'Mauvais1!' }, cookie });
  check('9. suspension refusée si mot de passe erroné', r.status === 400, `status=${r.status}`);
  r = await api('POST', '/api/auth/suspend', { body: { password: NEW_PASSWORD }, cookie });
  check('9b. compte suspendu', r.status === 200 && r.json?.success === true, `status=${r.status}`);
  r = await api('POST', '/api/auth/login', { body: { email: EMAIL, password: NEW_PASSWORD } });
  check('9c. connexion bloquée quand suspendu', r.status === 403 && r.json?.suspended === true, `status=${r.status}`);
  r = await api('GET', '/api/auth/me', { cookie });
  check('9d. /me signale la suspension', r.json?.user?.role === 'SUSPENDED', `role=${r.json?.user?.role}`);

  // 10) Réactivation
  r = await api('POST', '/api/auth/reactivate', { cookie });
  check('10. compte réactivé', r.status === 200 && r.json?.success === true, `status=${r.status}`);
  r = await api('POST', '/api/auth/login', { body: { email: EMAIL, password: NEW_PASSWORD } });
  check('10b. connexion de nouveau possible', r.status === 200, `status=${r.status}`);

  // 11) Export des données personnelles (RGPD)
  r = await api('GET', '/api/auth/export-data', { cookie });
  check('11. export JSON', r.status === 200 && r.text.includes(EMAIL), `status=${r.status}`);
  check(
    '11b. export proposé en téléchargement',
    (r.headers.get('content-disposition') || '').includes('attachment'),
    r.headers.get('content-disposition') || ''
  );

  // 11c) Donnée liée (pour vérifier la cascade à la suppression)
  const userId = rows[0].id;
  await db.query(
    `INSERT INTO conversions (id, user_id, input_file_name, input_format, output_format, status, credits_used, created_at)
     VALUES ($1, $2, 'test.pdf', 'pdf', 'docx', 'COMPLETED', 1, NOW())`,
    [`conv-${Date.now()}`, userId]
  );
  const before = await db.query('SELECT COUNT(*)::int AS n FROM conversions WHERE user_id = $1', [userId]);
  check('11c. conversion de test insérée', before.rows[0].n === 1, `n=${before.rows[0].n}`);

  // 12) Suppression définitive du compte
  r = await api('DELETE', '/api/auth/account', { body: { password: NEW_PASSWORD, confirmation: 'mauvais' }, cookie });
  check('12. suppression refusée sans le texte exact', r.status === 400, `status=${r.status}`);
  r = await api('DELETE', '/api/auth/account', { body: { password: 'Mauvais1!', confirmation: 'SUPPRIMER' }, cookie });
  check('12b. suppression refusée si mot de passe erroné', r.status === 400, `status=${r.status}`);

  r = await api('DELETE', '/api/auth/account', { body: { password: NEW_PASSWORD, confirmation: 'SUPPRIMER' }, cookie });
  check('12c. compte supprimé', r.status === 200 && r.json?.success === true, `status=${r.status}`);
  check('12d. cookie de session effacé', /auth-token=;/.test(r.setCookie), r.setCookie.split(';')[0]);

  const after = await db.query('SELECT COUNT(*)::int AS n FROM users WHERE id = $1', [userId]);
  check('12e. utilisateur absent de la base', after.rows[0].n === 0, `n=${after.rows[0].n}`);

  const cascade = await db.query('SELECT COUNT(*)::int AS n FROM conversions WHERE user_id = $1', [userId]);
  check('12f. données liées supprimées (cascade)', cascade.rows[0].n === 0, `n=${cascade.rows[0].n}`);

  r = await api('POST', '/api/auth/login', { body: { email: EMAIL, password: NEW_PASSWORD } });
  check('12g. connexion impossible après suppression', r.status === 401, `status=${r.status}`);

  // 13) Déconnexion
  r = await api('POST', '/api/auth/logout', { cookie });
  check('13. déconnexion → cookie effacé', r.status === 200 && /auth-token=;/.test(r.setCookie), r.setCookie.split(';')[0]);

  console.log(`\n=== RESULTAT : ${pass} OK / ${fail} ECHEC ===\n`);

  await db.end();
  process.exit(fail === 0 ? 0 : 1);
})().catch(async (error) => {
  console.error('ERREUR FATALE:', error);
  try {
    await db.end();
  } catch {}
  process.exit(1);
});
