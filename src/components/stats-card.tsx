'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, Database, Clock } from 'lucide-react'

interface Stats {
  totalJobs: number
  jobsToday: number
  byLevel: { level: string; count: number }[]
  bySource: { source: string; count: number }[]
  latestScrapes: {
    source: string
    status: string
    jobsFound: number
    startedAt: string
  }[]
}

export function StatsCard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Stats error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const lastUpdate = stats.latestScrapes[0]?.startedAt
    ? new Date(stats.latestScrapes[0].startedAt).toLocaleString()
    : 'Never'

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Jobs */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            <p className="text-sm text-gray-600">Total Jobs</p>
          </div>
        </div>

        {/* Jobs Today */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.jobsToday}</p>
            <p className="text-sm text-gray-600">Added Today</p>
          </div>
        </div>

        {/* Entry/Junior Count */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.byLevel
                .filter(l => ['ENTRY', 'JUNIOR', 'MID'].includes(l.level))
                .reduce((sum, l) => sum + l.count, 0)}
            </p>
            <p className="text-sm text-gray-600">Entry-Mid Level</p>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{lastUpdate}</p>
            <p className="text-sm text-gray-600">Last Updated</p>
          </div>
        </div>
      </div>

      {/* Source breakdown */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex flex-wrap gap-4">
          {stats.bySource.map(source => (
            <div key={source.source} className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                {source.source}:
              </span>
              <span className="text-sm font-bold text-gray-900">
                {source.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
