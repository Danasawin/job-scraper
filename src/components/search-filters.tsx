'use client'

import { useState } from 'react'
import { Search, Filter, MapPin, Building2 } from 'lucide-react'

export function SearchFilters() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [source, setSource] = useState('')

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Level Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Levels</option>
            <option value="ENTRY">Entry Level</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID">Mid Level</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Sources</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="JOBDB">JobDB</option>
            <option value="JOBTHAI">JobThai</option>
          </select>
        </div>
      </div>
    </div>
  )
}
