'use client'

import { ExternalLink, MapPin, Building2, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

interface JobCardProps {
  job: Job
}

const levelColors: Record<string, string> = {
  ENTRY: 'bg-green-100 text-green-800',
  JUNIOR: 'bg-blue-100 text-blue-800',
  MID: 'bg-purple-100 text-purple-800',
  SENIOR: 'bg-gray-100 text-gray-800',
  UNKNOWN: 'bg-gray-100 text-gray-600'
}

const sourceColors: Record<string, string> = {
  LINKEDIN: 'bg-blue-50 text-blue-700 border-blue-200',
  JOBDB: 'bg-orange-50 text-orange-700 border-orange-200',
  JOBTHAI: 'bg-red-50 text-red-700 border-red-200'
}

export function JobCard({ job }: JobCardProps) {
  const postedDate = job.postedAt 
    ? formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          {/* Title & Level */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {job.title}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[job.level] || levelColors.UNKNOWN}`}>
              {job.level}
            </span>
          </div>

          {/* Company */}
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{job.company}</span>
          </div>

          {/* Location & Posted */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{postedDate}</span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {job.description}
            </p>
          )}

          {/* Salary */}
          {job.salary && (
            <p className="text-green-600 text-sm font-medium mb-3">
              💰 {job.salary}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${sourceColors[job.source] || 'bg-gray-50 text-gray-700'}`}>
              {job.source}
            </span>
          </div>
        </div>

        {/* Apply Button */}
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
