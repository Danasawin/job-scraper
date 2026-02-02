import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get counts by level
    const levelCounts = await prisma.job.groupBy({
      by: ['level'],
      where: { isActive: true },
      _count: { id: true }
    })
    
    // Get counts by source
    const sourceCounts = await prisma.job.groupBy({
      by: ['source'],
      where: { isActive: true },
      _count: { id: true }
    })
    
    // Get latest scraping logs
    const latestLogs = await prisma.scrapingLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10
    })
    
    // Get total jobs
    const totalJobs = await prisma.job.count({ where: { isActive: true } })
    
    // Get jobs added today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const jobsToday = await prisma.job.count({
      where: {
        isActive: true,
        createdAt: { gte: today }
      }
    })
    
    return NextResponse.json({
      totalJobs,
      jobsToday,
      byLevel: levelCounts.map(l => ({
        level: l.level,
        count: l._count.id
      })),
      bySource: sourceCounts.map(s => ({
        source: s.source,
        count: s._count.id
      })),
      latestScrapes: latestLogs
    })
  } catch (error) {
    console.error('Stats API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
