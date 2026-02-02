import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const level = searchParams.get('level')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const jobType = searchParams.get('jobType')
    const timePosted = searchParams.get('timePosted')
    
    const where: any = { isActive: true }
    
    // Level filter
    if (level) {
      where.level = level.toUpperCase()
    }
    
    // Source filter
    if (source) {
      where.source = source.toUpperCase()
    }
    
    // Job Type filter (search in title)
    if (jobType) {
      where.OR = where.OR || []
      where.OR.push(
        { title: { contains: jobType, mode: 'insensitive' } },
        { description: { contains: jobType, mode: 'insensitive' } }
      )
    }
    
    // Time Posted filter
    if (timePosted) {
      const now = new Date()
      let dateFrom: Date
      
      switch (timePosted) {
        case '24h':
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          dateFrom = new Date(0) // All time
      }
      
      where.createdAt = { gte: dateFrom }
    }
    
    // Search filter
    if (search) {
      const searchConditions = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
      
      if (where.OR) {
        // Combine with jobType filter using AND
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ]
        delete where.OR
      } else {
        where.OR = searchConditions
      }
    }
    
    const skip = (page - 1) * limit
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' }, // Present to past (newest first)
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ])
    
    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
