import { NextRequest, NextResponse } from 'next/server'
import { ScraperOrchestrator } from '../../../../agents'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow Vercel's cron header
      const vercelSig = request.headers.get('x-vercel-signature')
      if (!vercelSig) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    console.log('[Cron] Starting daily scrape...')
    
    const orchestrator = new ScraperOrchestrator()
    const results = await orchestrator.runAll()
    
    const totalFound = results.reduce((sum, r) => sum + r.jobsFound, 0)
    const totalAdded = results.reduce((sum, r) => sum + r.jobsAdded, 0)
    
    console.log(`[Cron] Complete. Found: ${totalFound}, Added: ${totalAdded}`)
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalFound,
        totalAdded,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[Cron] Error:', error)
    return NextResponse.json(
      { error: 'Scraping failed', details: String(error) },
      { status: 500 }
    )
  }
}
