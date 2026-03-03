const { execSync } = require('child_process');

const PROJECT = 'convert-multimedia';

// 1) Get IAM policy on DATABASE_URL to see current bindings
console.log('=== Current IAM policy on DATABASE_URL ===');
try {
  const policy = execSync(`gcloud secrets get-iam-policy DATABASE_URL --project=${PROJECT}`, { encoding: 'utf8', timeout: 30000 });
  console.log(policy);
} catch (e) {
  console.log('ERROR:', e.stderr || e.message);
}

// 2) List all service accounts in the project
console.log('\n=== Service accounts in project ===');
try {
  const sas = execSync(`gcloud iam service-accounts list --project=${PROJECT} --format="value(email)"`, { encoding: 'utf8', timeout: 30000 });
  console.log(sas);
} catch (e) {
  console.log('ERROR:', e.stderr || e.message);
}

// 3) Check App Hosting backends
console.log('\n=== App Hosting backends ===');
try {
  const backends = execSync(`npx firebase-tools apphosting:backends:list --project ${PROJECT} --json`, { encoding: 'utf8', timeout: 60000 });
  console.log(backends);
} catch (e) {
  console.log('ERROR:', e.stderr || e.message);
}
