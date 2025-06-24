import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const client = await prisma.client.findFirst({
      include: {
        website: true,
        users: true
      }
    })
    
    console.log('Client found:', client)
    
    if (!client) {
      console.log('No client found. Running seed script...')
      // Create a test client
      const newClient = await prisma.client.create({
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
          users: true
        }
      })
      console.log('Created new client:', newClient)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 