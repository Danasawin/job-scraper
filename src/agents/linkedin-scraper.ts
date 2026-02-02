import axios from 'axios'
import * as cheerio from 'cheerio'
import { BaseScraper, ScrapedJob } from './base-scraper'

export class LinkedInScraper extends BaseScraper {
  readonly source = 'LINKEDIN'
  
  private readonly searchQueries = [
    'developer',
    'software engineer',
    'data engineer',
    'devops engineer',
    'cloud engineer'
  ]

  async scrape(): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = []
    
    // Note: LinkedIn heavily restricts scraping
    // This uses their public job search with limited results
    // For production, consider using LinkedIn API or third-party services
    
    for (const query of this.searchQueries) {
      try {
        const jobs = await this.searchJobs(query)
        allJobs.push(...jobs)
        await this.delay(2000) // Rate limiting
      } catch (error) {
        console.error(`LinkedIn scrape error for ${query}:`, error)
      }
    }
    
    return this.deduplicateJobs(allJobs)
  }

  private async searchJobs(keyword: string): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = []
    
    try {
      // LinkedIn jobs RSS feed (more scrape-friendly)
      const rssUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keyword)}&location=Thailand&start=0`
      
      const response = await axios.get(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      })

      const $ = cheerio.load(response.data)
      
      $('.job-search-card').each((_, element) => {
        const title = $(element).find('.base-search-card__title').text().trim()
        const company = $(element).find('.base-search-card__subtitle').text().trim()
        const location = $(element).find('.job-search-card__location').text().trim()
        const link = $(element).find('.base-card__full-link').attr('href') || ''
        const postedTime = $(element).find('.job-search-card__listdate').attr('datetime')
        
        if (!title || !company || !link) return
        
        // Filter for target jobs only
        if (!this.isTargetJob(title)) return
        
        const level = this.detectLevel(title)
        
        // Skip senior positions
        if (level === 'SENIOR') return
        
        jobs.push({
          title,
          company,
          location,
          level,
          sourceUrl: link.split('?')[0], // Clean URL
          postedAt: postedTime ? new Date(postedTime) : undefined
        })
      })
    } catch (error) {
      console.error('LinkedIn search error:', error)
    }
    
    return jobs
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
