import cron from 'node-cron'
import { ScraperOrchestrator } from './src/agents'

console.log('[Cron] Scheduler started')
console.log('[Cron] Scraping will run daily at 12:00 AM UTC')

// Schedule: 0 0 * * * = At 12:00 AM every day
cron.schedule('0 0 * * *', async () => {
  console.log(`[Cron] Starting scheduled scrape at ${new Date().toISOString()}`)
  
  try {
    const orchestrator = new ScraperOrchestrator()
    const results = await orchestrator.runAll()
    
    const totalFound = results.reduce((sum, r) => sum + r.jobsFound, 0)
    const totalAdded = results.reduce((sum, r) => sum + r.jobsAdded, 0)
    
    console.log(`[Cron] Complete! Found: ${totalFound}, Added: ${totalAdded}`)
  } catch (error) {
    console.error('[Cron] Error:', error)
  }
}, {
  timezone: 'UTC'
})

// Also run immediately on startup for testing (optional)
console.log('[Cron] You can also trigger manually via:')
console.log('[Cron] curl http://localhost:3000/api/cron/scrape -H "Authorization: Bearer YOUR_CRON_SECRET"')
