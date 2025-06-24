import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const trackEventSchema = z.object({
  apiKey: z.string(),
  eventType: z.string(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || '127.0.0.1'
}

// Helper function to parse user agent for device info
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  // Detect device type
  let deviceType = 'desktop'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet'
  }
  
  // Detect browser
  let browser = 'unknown'
  if (ua.includes('chrome')) browser = 'chrome'
  else if (ua.includes('firefox')) browser = 'firefox'
  else if (ua.includes('safari')) browser = 'safari'
  else if (ua.includes('edge')) browser = 'edge'
  
  // Detect OS
  let os = 'unknown'
  if (ua.includes('windows')) os = 'windows'
  else if (ua.includes('mac')) os = 'macos'
  else if (ua.includes('linux')) os = 'linux'
  else if (ua.includes('android')) os = 'android'
  else if (ua.includes('ios')) os = 'ios'
  
  return { deviceType, browser, os }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = trackEventSchema.parse(body)
    
    // Find website by API key
    const website = await prisma.website.findUnique({
      where: {
        apiKey: validatedData.apiKey,
        isActive: true,
      },
    })
    
    if (!website) {
      return NextResponse.json(
        { error: 'Invalid API key or website inactive' },
        { status: 401 }
      )
    }
    
    // Get client information
    const ipAddress = getClientIP(request)
    const userAgent = validatedData.userAgent || request.headers.get('user-agent') || ''
    const { deviceType, browser, os } = parseUserAgent(userAgent)
    
    // Create analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        websiteId: website.id,
        eventType: validatedData.eventType,
        pageUrl: validatedData.pageUrl,
        referrer: validatedData.referrer,
        userAgent,
        ipAddress,
        deviceType,
        browser,
        os,
        sessionId: validatedData.sessionId,
        userId: validatedData.userId,
        metadata: validatedData.metadata || {},
      },
    })
    
    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 