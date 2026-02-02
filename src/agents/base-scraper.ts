export interface ScrapedJob {
  title: string
  company: string
  description?: string
  level: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'UNKNOWN'
  location?: string
  salary?: string
  sourceUrl: string
  postedAt?: Date
}

export interface ScraperResult {
  success: boolean
  jobsFound: number
  jobsAdded: number
  error?: string
}

export abstract class BaseScraper {
  abstract readonly source: string
  
  protected targetKeywords = [
    'developer',
    'engineer',
    'data engineer',
    'devops',
    'devsecops',
    'cloud engineer',
    'software engineer',
    'frontend',
    'backend',
    'fullstack',
    'programmer'
  ]
  
  protected juniorKeywords = [
    'entry level',
    'entry-level',
    'junior',
    'jr.',
    'jr ',
    'fresh grad',
    'new grad',
    '0-1 year',
    '0-2 years',
    '1-2 years',
    '1-3 years'
  ]
  
  protected midKeywords = [
    'mid level',
    'mid-level',
    'intermediate',
    '2-4 years',
    '2-5 years',
    '3-5 years'
  ]
  
  protected seniorKeywords = [
    'senior',
    'sr.',
    'sr ',
    'lead',
    'principal',
    'staff',
    'manager',
    'head of',
    'director',
    '5+ years',
    '6+ years'
  ]

  abstract scrape(): Promise<ScrapedJob[]>

  protected isTargetJob(title: string): boolean {
    const lowerTitle = title.toLowerCase()
    return this.targetKeywords.some(keyword => lowerTitle.includes(keyword))
  }

  protected detectLevel(title: string, description?: string): ScrapedJob['level'] {
    const text = `${title} ${description || ''}`.toLowerCase()
    
    // Check for senior indicators first (exclude these)
    if (this.seniorKeywords.some(k => text.includes(k))) {
      return 'SENIOR'
    }
    
    // Check for entry/junior
    if (this.juniorKeywords.some(k => text.includes(k))) {
      return Math.random() > 0.5 ? 'ENTRY' : 'JUNIOR'
    }
    
    // Check for mid-level
    if (this.midKeywords.some(k => text.includes(k))) {
      return 'MID'
    }
    
    return 'UNKNOWN'
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
