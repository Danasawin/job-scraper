'use client'

import { useState, useEffect } from 'react'
import { JobCard } from './job-card'
import { Loader2 } from 'lucide-react'

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

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [page])

  async function fetchJobs() {
    try {
      setLoading(true)
      const res = await fetch(`/api/jobs?page=${page}&limit=20`)
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

  if (loading) {
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
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {jobs.length} jobs
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No jobs found. Check back later!
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
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
