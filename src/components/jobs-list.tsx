'use client'

import { useState, useEffect } from 'react'
import { JobCard } from './job-card'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchFilters } from './search-filters'

interface Job {
  id: string
  title: string
  company: string
  description?: string
  level: string
  location?: string
  salary?: string
  source: string
  sourceUrl: string
  postedAt?: string
  createdAt: string
}

const levelLabels: Record<string, string> = {
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  UNKNOWN: 'Unknown'
}

const jobTypeLabels: Record<string, string> = {
  'developer': 'Developer',
  'data engineer': 'Data Engineer',
  'data analyst': 'Data Analyst',
  'devops': 'DevOps',
  'cloud': 'Cloud Engineer'
}

const timePostedLabels: Record<string, string> = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days'
}

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')
  
  // Filter states
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [source, setSource] = useState('')
  const [jobType, setJobType] = useState('')
  const [timePosted, setTimePosted] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [page, search, level, source, jobType, timePosted])

  async function fetchJobs() {
    try {
      setLoading(true)
      
      // Build query params
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      if (search) params.append('search', search)
      if (level) params.append('level', level)
      if (source) params.append('source', source)
      if (jobType) params.append('jobType', jobType)
      if (timePosted) params.append('timePosted', timePosted)
      
      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      setJobs(data.jobs)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      setError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  // Reset to page 1 when filters change
  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleLevelChange = (value: string) => {
    setLevel(value)
    setPage(1)
  }

  const handleSourceChange = (value: string) => {
    setSource(value)
    setPage(1)
  }

  const handleJobTypeChange = (value: string) => {
    setJobType(value)
    setPage(1)
  }

  const handleTimePostedChange = (value: string) => {
    setTimePosted(value)
    setPage(1)
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <SearchFilters
        search={search}
        level={level}
        source={source}
        jobType={jobType}
        timePosted={timePosted}
        onSearch={handleSearch}
        onLevelChange={handleLevelChange}
        onSourceChange={handleSourceChange}
        onJobTypeChange={handleJobTypeChange}
        onTimePostedChange={handleTimePostedChange}
      />

      {/* Results count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `Showing ${jobs.length} jobs`}
          {jobType && ` • ${jobTypeLabels[jobType] || jobType}`}
          {level && ` • ${levelLabels[level] || level}`}
          {timePosted && ` • ${timePostedLabels[timePosted]}`}
          {source && ` • ${source}`}
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border">
          <p className="text-lg mb-2">No jobs found</p>
          {(search || level || source || jobType || timePosted) && (
            <p className="text-sm">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 font-medium bg-gray-100 rounded-lg">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
