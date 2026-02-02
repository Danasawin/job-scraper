'use client'

import { Search, Filter, Building2, ChevronDown, Briefcase, Clock } from 'lucide-react'

interface SearchFiltersProps {
  onSearch: (search: string) => void
  onLevelChange: (level: string) => void
  onSourceChange: (source: string) => void
  onJobTypeChange: (jobType: string) => void
  onTimePostedChange: (timePosted: string) => void
  search: string
  level: string
  source: string
  jobType: string
  timePosted: string
}

export function SearchFilters({ 
  onSearch, 
  onLevelChange, 
  onSourceChange,
  onJobTypeChange,
  onTimePostedChange,
  search,
  level,
  source,
  jobType,
  timePosted
}: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 relative min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, companies..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Job Type Filter */}
        <div className="relative min-w-[180px]">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={jobType}
            onChange={(e) => onJobTypeChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
          >
            <option value="" className="text-gray-900">All Job Types</option>
            <option value="developer" className="text-gray-900">Developer</option>
            <option value="data engineer" className="text-gray-900">Data Engineer</option>
            <option value="data analyst" className="text-gray-900">Data Analyst</option>
            <option value="devops" className="text-gray-900">DevOps</option>
            <option value="cloud" className="text-gray-900">Cloud Engineer</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Level Filter */}
        <div className="relative min-w-[160px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
          >
            <option value="" className="text-gray-900">All Levels</option>
            <option value="ENTRY" className="text-gray-900">Entry Level</option>
            <option value="JUNIOR" className="text-gray-900">Junior</option>
            <option value="MID" className="text-gray-900">Mid Level</option>
            <option value="UNKNOWN" className="text-gray-900">Unknown</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Time Posted Filter */}
        <div className="relative min-w-[160px]">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={timePosted}
            onChange={(e) => onTimePostedChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
          >
            <option value="" className="text-gray-900">Any Time</option>
            <option value="24h" className="text-gray-900">Last 24 Hours</option>
            <option value="7d" className="text-gray-900">Last 7 Days</option>
            <option value="30d" className="text-gray-900">Last 30 Days</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Source Filter */}
        <div className="relative min-w-[160px]">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
          >
            <option value="" className="text-gray-900">All Sources</option>
            <option value="LINKEDIN" className="text-gray-900">LinkedIn</option>
            <option value="JOBDB" className="text-gray-900">JobDB</option>
            <option value="JOBTHAI" className="text-gray-900">JobThai</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
