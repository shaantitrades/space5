const { execSync } = require('child_process');
const fs = require('fs');

const PROJECT = 'convert-multimedia';
const PROJECT_NUMBER = '635742837199';
const LOG = [];

const serviceAgents = [
  `service-${PROJECT_NUMBER}@gcp-sa-cloudbuild.iam.gserviceaccount.com`,
  `service-${PROJECT_NUMBER}@firebase-app-hosting.iam.gserviceaccount.com`,
  `service-${PROJECT_NUMBER}@serverless-robot-prod.iam.gserviceaccount.com`,
  `firebase-app-hosting-compute@${PROJECT}.iam.gserviceaccount.com`,
  `${PROJECT_NUMBER}-compute@developer.gserviceaccount.com`,
  `${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com`,
];

const secrets = [
  'DATABASE_URL', 'DIRECT_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'REDIS_URL',
  'STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'UPLOADTHING_SECRET', 'UPLOADTHING_APP_ID',
  'ENCRYPTION_KEY', 'JWT_SECRET', 'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
];

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    return 'ERR: ' + ((e.stderr || '') + (e.stdout || '')).substring(0, 200);
  }
}

LOG.push(`Granting access: ${serviceAgents.length} SAs x ${secrets.length} secrets\n`);

for (const sa of serviceAgents) {
  LOG.push(`\nSA: ${sa}`);
  for (const secret of secrets) {
    const r = run(`gcloud secrets add-iam-policy-binding ${secret} --project=${PROJECT} --member="serviceAccount:${sa}" --role="roles/secretmanager.secretAccessor" --quiet`);
    const status = r.includes('ERR:') ? r.substring(0, 120) : 'OK';
    LOG.push(`  ${secret}: ${status}`);
  }
}

LOG.push('\n=== DONE ===');
const output = LOG.join('\n');
fs.writeFileSync('_grant-result.txt', output);
console.log(output);
