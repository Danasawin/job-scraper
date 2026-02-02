import { prisma } from '../lib/prisma'
import { LinkedInScraper } from './linkedin-scraper'
import { JobDBScraper } from './jobdb-scraper'
import { JobThaiScraper } from './jobthai-scraper'
import { BaseScraper, ScrapedJob, ScraperResult } from './base-scraper'

interface AgentConfig {
  name: string
  scraper: BaseScraper
  enabled: boolean
}

export class ScraperOrchestrator {
  private agents: AgentConfig[]
  
  constructor() {
    this.agents = [
      { name: 'LinkedIn', scraper: new LinkedInScraper(), enabled: true },
      { name: 'JobDB', scraper: new JobDBScraper(), enabled: true },
      { name: 'JobThai', scraper: new JobThaiScraper(), enabled: true },
    ]
  }

  async runAll(): Promise<ScraperResult[]> {
    const results: ScraperResult[] = []
    
    for (const agent of this.agents) {
      if (!agent.enabled) continue
      
      const result = await this.runAgent(agent)
      results.push(result)
      
      // Delay between agents to be nice to servers
      await this.delay(3000)
    }
    
    return results
  }

  async runAgent(agent: AgentConfig): Promise<ScraperResult> {
    // Create log entry
    const log = await prisma.scrapingLog.create({
      data: {
        source: agent.scraper.source as any,
        status: 'RUNNING',
        startedAt: new Date()
      }
    })

    try {
      console.log(`[${agent.name}] Starting scrape...`)
      
      // Run the scraper
      const jobs = await agent.scraper.scrape()
      
      console.log(`[${agent.name}] Found ${jobs.length} jobs`)
      
      // Filter and save jobs
      const added = await this.saveJobs(jobs, agent.scraper.source)
      
      // Update log
      await prisma.scrapingLog.update({
        where: { id: log.id },
        data: {
          status: 'SUCCESS',
          jobsFound: jobs.length,
          jobsAdded: added,
          endedAt: new Date()
        }
      })
      
      console.log(`[${agent.name}] Added ${added} new jobs`)
      
      return {
        success: true,
        jobsFound: jobs.length,
        jobsAdded: added
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      console.error(`[${agent.name}] Error:`, errorMessage)
      
      await prisma.scrapingLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          error: errorMessage,
          endedAt: new Date()
        }
      })
      
      return {
        success: false,
        jobsFound: 0,
        jobsAdded: 0,
        error: errorMessage
      }
    }
  }

  private async saveJobs(jobs: ScrapedJob[], source: string): Promise<number> {
    let added = 0
    
    for (const job of jobs) {
      try {
        // Skip if URL already exists
        const existing = await prisma.job.findUnique({
          where: { sourceUrl: job.sourceUrl }
        })
        
        if (existing) {
          // Update if job data changed
          if (existing.title !== job.title || existing.company !== job.company) {
            await prisma.job.update({
              where: { id: existing.id },
              data: {
                title: job.title,
                company: job.company,
                description: job.description,
                level: job.level,
                location: job.location,
                salary: job.salary,
                postedAt: job.postedAt
              }
            })
          }
          continue
        }
        
        // Create new job
        await prisma.job.create({
          data: {
            title: job.title,
            company: job.company,
            description: job.description,
            level: job.level,
            location: job.location,
            salary: job.salary,
            source: source as any,
            sourceUrl: job.sourceUrl,
            postedAt: job.postedAt
          }
        })
        
        added++
      } catch (error) {
        console.error(`Error saving job ${job.title}:`, error)
      }
    }
    
    return added
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getAgentStatus(): { name: string; enabled: boolean }[] {
    return this.agents.map(a => ({ name: a.name, enabled: a.enabled }))
  }
}
