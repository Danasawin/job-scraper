const { ScraperOrchestrator } = require('./src/agents');

async function runScrape() {
  console.log('🚀 Starting job scrape...\n');
  
  try {
    const orchestrator = new ScraperOrchestrator();
    const results = await orchestrator.runAll();
    
    console.log('\n📊 Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalFound = 0;
    let totalAdded = 0;
    
    for (const result of results) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.jobsAdded} new jobs (${result.jobsFound} found)`);
      totalFound += result.jobsFound;
      totalAdded += result.jobsAdded;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 Total: ${totalAdded} new jobs added (${totalFound} found)`);
    console.log('\n✨ Done! Next scrape: tomorrow at 12:00 AM UTC');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

runScrape();
