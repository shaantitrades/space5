const { execSync } = require('child_process');

const PROJECT = 'convert-multimedia';

// List service accounts
console.log('=== Service accounts ===');
try {
  const sas = execSync(`gcloud iam service-accounts list --project=${PROJECT}`, { encoding: 'utf8', timeout: 30000 });
  console.log(sas);
} catch (e) {
  console.log('ERROR:', (e.stderr || '') + (e.stdout || ''));
}

// Check Cloud Build SA
console.log('\n=== Cloud Build config ===');
try {
  const cb = execSync(`gcloud builds list --project=${PROJECT} --limit=1 --format=json`, { encoding: 'utf8', timeout: 30000 });
  const builds = JSON.parse(cb);
  if (builds.length > 0) {
    console.log('Service account:', builds[0].serviceAccount);
    console.log('Build ID:', builds[0].id);
  }
} catch (e) {
  console.log('ERROR:', (e.stderr || '') + (e.stdout || ''));
}
