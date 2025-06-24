import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if a client already exists
  const existingClient = await prisma.client.findFirst()
  
  if (existingClient) {
    console.log('Client already exists:', existingClient)
    console.log('Ready to configure website!')
    return
  }

  // Create a test client without a website
  const client = await prisma.client.create({
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
    }
  })

  console.log('Created client:', client)
  console.log('Ready to configure website!')
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