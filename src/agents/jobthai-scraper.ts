import axios from 'axios'
import * as cheerio from 'cheerio'
import { BaseScraper, ScrapedJob } from './base-scraper'

export class JobThaiScraper extends BaseScraper {
  readonly source = 'JOBTHAI'
  
  private readonly baseUrl = 'https://www.jobthai.com'
  
  async scrape(): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = []
    
    const searchKeywords = [
      'developer',
      'programmer',
      'software engineer',
      'data engineer',
      'devops',
      'cloud'
    ]
    
    for (const keyword of searchKeywords) {
      try {
        const jobs = await this.searchJobs(keyword)
        allJobs.push(...jobs)
        await this.delay(2000)
      } catch (error) {
        console.error(`JobThai scrape error for ${keyword}:`, error)
      }
    }
    
    return this.deduplicateJobs(allJobs)
  }

  private async searchJobs(keyword: string): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = []
    
    try {
      const searchUrl = `${this.baseUrl}/th/job-search/${encodeURIComponent(keyword)}`
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'th,en-US;q=0.7,en;q=0.3',
        },
        timeout: 30000
      })

      const $ = cheerio.load(response.data)
      
      // JobThai job card selectors
      $('.job-card, [class*="JobCard"], .jlt-result').each((_, element) => {
        const titleEl = $(element).find('a[href*="/job/"]').first()
        const title = titleEl.text().trim()
        const link = titleEl.attr('href') || ''
        
        // Try multiple selectors for company name
        const company = $(element).find('.company-name, [class*="company"], .employer-name').first().text().trim()
        
        // Try multiple selectors for location
        const location = $(element).find('.location, [class*="location"], .job-location').first().text().trim()
        
        // Try to get salary info
        const salary = $(element).find('.salary, [class*="salary"], .job-salary').first().text().trim()
        
        // Posted date
        const postedText = $(element).find('.posted-date, [class*="posted"], .job-date').first().text().trim()
        
        if (!title || !company) return
        
        // Filter for target jobs
        if (!this.isTargetJob(title)) return
        
        const level = this.detectLevel(title)
        if (level === 'SENIOR') return
        
        const postedAt = this.parseThaiDate(postedText)
        
        jobs.push({
          title,
          company,
          location: location || undefined,
          salary: salary || undefined,
          level,
          sourceUrl: link.startsWith('http') ? link : this.baseUrl + link,
          postedAt
        })
      })

      // If no jobs found with primary selectors, try alternative
      if (jobs.length === 0) {
        $('a[href*="/job/"]').each((_, element) => {
          const link = $(element).attr('href') || ''
          const title = $(element).text().trim()
          
          // Get parent container
          const parent = $(element).closest('div, article, li')
          const company = parent.find('span, div').filter((_, el) => {
            const text = $(el).text().trim()
            return text.length > 0 && text !== title
          }).first().text().trim()
          
          if (!title || !company) return
          if (!this.isTargetJob(title)) return
          
          const level = this.detectLevel(title)
          if (level === 'SENIOR') return
          
          jobs.push({
            title,
            company,
            level,
            sourceUrl: link.startsWith('http') ? link : this.baseUrl + link
          })
        })
      }
    } catch (error) {
      console.error('JobThai search error:', error)
    }
    
    return jobs
  }

  private parseThaiDate(text: string): Date | undefined {
    if (!text) return undefined
    
    const now = new Date()
    const lower = text.toLowerCase()
    
    // Thai date patterns
    if (lower.includes('วันนี้') || lower.includes('today')) return now
    if (lower.includes('เมื่อวาน') || lower.includes('yesterday')) {
      return new Date(now.setDate(now.getDate() - 1))
    }
    
    // Pattern: X วันที่แล้ว, X ชั่วโมงที่แล้ว
    const thaiMatch = text.match(/(\d+)\s*(วัน|ชั่วโมง|นาที|สัปดาห์)/)
    if (thaiMatch) {
      const num = parseInt(thaiMatch[1])
      const unit = thaiMatch[2]
      
      if (unit === 'วัน') return new Date(now.setDate(now.getDate() - num))
      if (unit === 'ชั่วโมง') return new Date(now.setHours(now.getHours() - num))
      if (unit === 'นาที') return new Date(now.setMinutes(now.getMinutes() - num))
      if (unit === 'สัปดาห์') return new Date(now.setDate(now.getDate() - (num * 7)))
    }
    
    // English patterns
    const engMatch = lower.match(/(\d+)\s*(day|hour|minute|week)s?\s*ago/)
    if (engMatch) {
      const num = parseInt(engMatch[1])
      const unit = engMatch[2]
      
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
