import axios from 'axios'
import * as cheerio from 'cheerio'
import { BaseScraper, ScrapedJob } from './base-scraper'

export class JobDBScraper extends BaseScraper {
  readonly source = 'JOBDB'
  
  private readonly baseUrl = 'https://th.jobsdb.com'
  
  async scrape(): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = []
    
    const searchUrls = [
      `${this.baseUrl}/developer-jobs`,
      `${this.baseUrl}/software-engineer-jobs`,
      `${this.baseUrl}/data-engineer-jobs`,
      `${this.baseUrl}/devops-engineer-jobs`,
      `${this.baseUrl}/cloud-engineer-jobs`
    ]
    
    for (const url of searchUrls) {
      try {
        const jobs = await this.scrapePage(url)
        allJobs.push(...jobs)
        await this.delay(1500)
      } catch (error) {
        console.error(`JobDB scrape error for ${url}:`, error)
      }
    }
    
    return this.deduplicateJobs(allJobs)
  }

  private async scrapePage(url: string): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = []
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 30000
      })

      const $ = cheerio.load(response.data)
      
      // JobDB uses article elements for job cards
      $('article[data-testid="job-card"]').each((_, element) => {
        const titleEl = $(element).find('h3 a')
        const title = titleEl.text().trim()
        const link = this.baseUrl + titleEl.attr('href') || ''
        const company = $(element).find('[data-testid="company-name"]').text().trim()
        const location = $(element).find('[data-testid="job-location"]').text().trim()
        const postedText = $(element).find('[data-testid="job-listing-date"]').text().trim()
        
        if (!title || !company) return
        
        // Check if it's a target job
        if (!this.isTargetJob(title)) return
        
        const level = this.detectLevel(title)
        if (level === 'SENIOR') return
        
        const postedAt = this.parsePostedDate(postedText)
        
        jobs.push({
          title,
          company,
          location,
          level,
          sourceUrl: link,
          postedAt
        })
      })

      // Alternative selector if the above doesn't match
      if (jobs.length === 0) {
        $('.job-card, .z1s6m00, [class*="JobCard"]').each((_, element) => {
          const title = $(element).find('a[href*="/job/"]').first().text().trim()
          const link = $(element).find('a[href*="/job/"]').first().attr('href') || ''
          const company = $(element).find('[class*="company"], [class*="Company"]').first().text().trim()
          const location = $(element).find('[class*="location"], [class*="Location"]').first().text().trim()
          
          if (!title || !company) return
          if (!this.isTargetJob(title)) return
          
          const level = this.detectLevel(title)
          if (level === 'SENIOR') return
          
          jobs.push({
            title,
            company,
            location,
            level,
            sourceUrl: link.startsWith('http') ? link : this.baseUrl + link
          })
        })
      }
    } catch (error) {
      console.error('JobDB page scrape error:', error)
    }
    
    return jobs
  }

  private parsePostedDate(text: string): Date | undefined {
    if (!text) return undefined
    
    const now = new Date()
    const lower = text.toLowerCase()
    
    if (lower.includes('today')) return now
    if (lower.includes('yesterday')) {
      return new Date(now.setDate(now.getDate() - 1))
    }
    
    const match = lower.match(/(\d+)\s*(day|hour|minute|week)s?\s*ago/)
    if (match) {
      const num = parseInt(match[1])
      const unit = match[2]
      
      if (unit === 'day') return new Date(now.setDate(now.getDate() - num))
      if (unit === 'hour') return new Date(now.setHours(now.getHours() - num))
      if (unit === 'week') return new Date(now.setDate(now.getDate() - (num * 7)))
    }
    
    return undefined
  }

  private deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
