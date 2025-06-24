import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

// Generate a secure API key
function generateApiKey(): string {
  return `ak_${randomBytes(32).toString('hex')}`
}

// GET - Fetch client's website configuration
export async function GET(request: NextRequest) {
  try {
    // For now, we're using the first client
    // In production, this would be based on authenticated user
    let client = await prisma.client.findFirst({
      include: {
        website: true
      }
    })

    // If no client exists, create a demo client
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: 'Demo Company',
          email: 'demo@example.com',
          plan: 'free',
          users: {
            create: {
              email: 'demo@example.com',
              role: 'owner'
            }
          }
        },
        include: {
          website: true
        }
      })
      console.log('Created demo client:', client.id)
    }

    return NextResponse.json({ 
      client: {
        id: client.id,
        name: client.name,
        email: client.email
      },
      website: client.website 
    })
  } catch (error) {
    console.error('Error fetching website:', error)
    
    // If it's a prepared statement error, try a simple response
    if (error instanceof Error && error.message.includes('prepared statement')) {
      // Return a mock client for development
      return NextResponse.json({ 
        client: {
          id: 'demo-client-id',
          name: 'Demo Company',
          email: 'demo@example.com'
        },
        website: null 
      })
    }
    
    return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 })
  }
}

// POST - Create new website configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, name, domain } = body

    if (!clientId || !name || !domain) {
      return NextResponse.json({ 
        error: 'Missing required fields: clientId, name, domain' 
      }, { status: 400 })
    }

    // If it's the demo client ID, first try to get or create a real client
    if (clientId === 'demo-client-id') {
      let client = await prisma.client.findFirst()
      
      if (!client) {
        client = await prisma.client.create({
          data: {
            name: 'Demo Company',
            email: 'demo@example.com',
            plan: 'free'
          }
        })
      }
      
      // Create website with the real client ID
      const website = await prisma.website.create({
        data: {
          clientId: client.id,
          name,
          domain,
          apiKey: generateApiKey(),
          isActive: true
        }
      })

      return NextResponse.json({ website }, { status: 201 })
    }

    // Check if client already has a website
    const existingWebsite = await prisma.website.findUnique({
      where: { clientId }
    })

    if (existingWebsite) {
      return NextResponse.json({ 
        error: 'Client already has a website configured' 
      }, { status: 400 })
    }

    // Create new website
    const website = await prisma.website.create({
      data: {
        clientId,
        name,
        domain,
        apiKey: generateApiKey(),
        isActive: true
      }
    })

    return NextResponse.json({ website }, { status: 201 })
  } catch (error) {
    console.error('Error creating website:', error)
    return NextResponse.json({ error: 'Failed to create website' }, { status: 500 })
  }
}

// PUT - Update website configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { websiteId, name, domain, isActive, regenerateApiKey } = body

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (domain !== undefined) updateData.domain = domain
    if (isActive !== undefined) updateData.isActive = isActive
    if (regenerateApiKey) updateData.apiKey = generateApiKey()

    const website = await prisma.website.update({
      where: { id: websiteId },
      data: updateData
    })

    return NextResponse.json({ website })
  } catch (error) {
    console.error('Error updating website:', error)
    return NextResponse.json({ error: 'Failed to update website' }, { status: 500 })
  }
} 