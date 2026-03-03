const { execSync } = require('child_process');

const PROJECT = 'convert-multimedia';
const PROJECT_NUMBER = '635742837199';

// Additional service agents used by Cloud Build / App Hosting internally
const additionalSAs = [
  `service-${PROJECT_NUMBER}@gcp-sa-cloudbuild.iam.gserviceaccount.com`,
  `${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com`,
  `service-${PROJECT_NUMBER}@firebase-app-hosting.iam.gserviceaccount.com`,
  `service-${PROJECT_NUMBER}@serverless-robot-prod.iam.gserviceaccount.com`,
  `firebase-app-hosting-compute@${PROJECT}.iam.gserviceaccount.com`,
  `${PROJECT_NUMBER}-compute@developer.gserviceaccount.com`,
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
    return { ok: true, out: execSync(cmd, { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] }) };
  } catch (e) {
    return { ok: false, out: (e.stderr || '') + (e.stdout || '') };
  }
}

console.log(`\nGranting access to ${additionalSAs.length} service accounts on ${secrets.length} secrets...\n`);

for (const sa of additionalSAs) {
  console.log(`\nSA: ${sa}`);
  for (const secret of secrets) {
    process.stdout.write(`  ${secret} ... `);
    const r = run(`gcloud secrets add-iam-policy-binding ${secret} --project=${PROJECT} --member="serviceAccount:${sa}" --role="roles/secretmanager.secretAccessor" --quiet`);
    if (r.ok || r.out.includes('Updated')) {
      console.log('OK');
    } else if (r.out.includes('already exists')) {
      console.log('already set');
    } else {
      console.log('SKIP -', r.out.substring(0, 100).replace(/\n/g, ' '));
    }
  }
}

console.log('\n=== Done ===');
