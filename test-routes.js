// Test automatisé des routes OMNIVERSA
// Usage: node test-routes.js

const routes = [
  '/',
  '/fr',
  '/en',
  '/tools',
  '/pdf',
  '/images',
  '/media',
  '/dashboard',
  '/pricing',
  '/documentation',
  '/entreprise',
  '/blog',
  '/login',
  '/signup',
  '/convert',
];

async function testRoute(route) {
  try {
    const start = Date.now();
    const response = await fetch(`http://localhost:3000${route}`);
    const duration = Date.now() - start;
    
    return {
      route,
      status: response.status,
      ok: response.ok,
      duration,
      contentType: response.headers.get('content-type'),
    };
  } catch (error) {
    return {
      route,
      error: error.message,
      ok: false,
    };
  }
}

async function runTests() {
  console.log('🧪 OMNIVERSA - Test des Routes\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const route of routes) {
    process.stdout.write(`Testing ${route.padEnd(25)}... `);
    const result = await testRoute(route);
    results.push(result);
    
    if (result.ok) {
      console.log(`✅ ${result.status} (${result.duration}ms)`);
    } else {
      console.log(`❌ ${result.error || result.status}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  
  console.log(`\n📊 Résultats: ${passed}/${routes.length} réussis`);
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / passed;
  
  console.log(`⏱️  Temps moyen: ${avgDuration.toFixed(0)}ms\n`);
  
  if (failed > 0) {
    console.log('❌ Routes échouées:');
    results.filter(r => !r.ok).forEach(r => {
      console.log(`  - ${r.route}: ${r.error || r.status}`);
    });
  }
}

runTests().catch(console.error);
