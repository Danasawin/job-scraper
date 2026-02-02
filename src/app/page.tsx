import { JobsList } from '@/components/jobs-list'
import { StatsCard } from '@/components/stats-card'
import { SearchFilters } from '@/components/search-filters'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Tech Jobs Aggregator
        </h1>
        <p className="text-gray-600">
          Entry, Junior & Mid-level positions from LinkedIn, JobDB, and JobThai
        </p>
      </div>

      {/* Stats */}
      <StatsCard />

      {/* Search & Filters */}
      <SearchFilters />

      {/* Jobs List */}
      <JobsList />
    </div>
  )
}
