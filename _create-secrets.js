const { execSync } = require('child_process');

const PROJECT = 'convert-multimedia';

// Secrets à créer — valeurs tirées de .env.local
const secrets = {
  DATABASE_URL: 'postgresql://postgres.poilochddyciosejieyy:Hababaumri11@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  DIRECT_URL: 'postgresql://postgres:Hababaumri11@db.poilochddyciosejieyy.supabase.co:5432/postgres',
  SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_0HZWpwOmvkBRUeOiRWHcXw_yM6EBTgz',
  REDIS_URL: 'redis://localhost:6379',
  STRIPE_SECRET_KEY: 'sk_test_placeholder',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
  UPLOADTHING_SECRET: 'sk_live_placeholder',
  UPLOADTHING_APP_ID: 'placeholder',
  ENCRYPTION_KEY: 'dev-encryption-key-32chars-minimum-local!!',
  JWT_SECRET: 'dev-jwt-secret-32chars-minimum-local-dev-only!!',
  NEXTAUTH_SECRET: 'dev-secret-key-32chars-minimum-local-dev-only!!',
  GOOGLE_CLIENT_ID: 'dev-google-client-id',
  GOOGLE_CLIENT_SECRET: 'dev-google-client-secret',
};

function run(cmd, input) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      timeout: 60000,
      input: input || undefined,
      stdio: input ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
    });
  } catch (e) {
    return e.stderr || e.stdout || e.message;
  }
}

console.log(`\n=== Creating ${Object.keys(secrets).length} secrets in project ${PROJECT} ===\n`);

let ok = 0, fail = 0;

for (const [name, value] of Object.entries(secrets)) {
  process.stdout.write(`  ${name} ... `);

  // Try creating secret first
  let result = run(
    `npx firebase-tools apphosting:secrets:set ${name} --project ${PROJECT} --force --json`,
    value + '\n'
  );

  if (result.includes('"status":"success"') || result.includes('already exists')) {
    console.log('OK');
    ok++;
  } else {
    // Fallback: try gcloud create then add version
    let r2 = run(`gcloud secrets create ${name} --project=${PROJECT} --replication-policy=automatic`, '');
    let r3 = run(`gcloud secrets versions add ${name} --project=${PROJECT} --data-file=-`, value);
    if (r3.includes('Created version') || r3.includes('name:')) {
      console.log('OK (gcloud)');
      ok++;
    } else {
      console.log('FAILED');
      console.log('    ', (result + r2 + r3).substring(0, 200));
      fail++;
    }
  }
}

console.log(`\n=== Done: ${ok} OK / ${fail} failed ===\n`);

if (fail > 0) {
  console.log('For failed secrets, create them manually:');
  console.log(`  gcloud secrets create <NAME> --project=${PROJECT} --replication-policy=automatic`);
  console.log(`  echo "value" | gcloud secrets versions add <NAME> --project=${PROJECT} --data-file=-`);
}

console.log('\nNext step: grant access to App Hosting backend:');
console.log(`  npx firebase-tools apphosting:secrets:grantaccess --project ${PROJECT}`);

