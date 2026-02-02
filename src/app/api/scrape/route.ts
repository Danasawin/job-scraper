import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key verification here
    const apiKey = request.headers.get('x-api-key')
    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { agent } = body || {}
    
    // Dynamic import to avoid build-time bundling issues
    const { ScraperOrchestrator } = await import('../../../agents')
    const orchestrator = new ScraperOrchestrator()
    
    let results
    if (agent) {
      // Run specific agent
      const agents = orchestrator.getAgentStatus()
      const targetAgent = agents.find(a => 
        a.name.toLowerCase() === agent.toLowerCase()
      )
      
      if (!targetAgent) {
        return NextResponse.json(
          { error: 'Agent not found', available: agents.map(a => a.name) },
          { status: 404 }
        )
      }
      
      // Would need to expose single agent run in orchestrator
      results = await orchestrator.runAll() // Simplified
    } else {
      results = await orchestrator.runAll()
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Scrape API Error:', error)
    return NextResponse.json(
      { error: 'Scraping failed', details: String(error) },
      { status: 500 }
    )
  }
}
