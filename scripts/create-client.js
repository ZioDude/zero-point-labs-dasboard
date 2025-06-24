const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // First check if a client exists
    const existingClient = await prisma.client.findFirst();
    
    if (existingClient) {
      console.log('Client already exists:', existingClient);
      return;
    }
    
    // Create a new client
    const client = await prisma.client.create({
      data: {
        name: 'Demo Company',
        email: 'demo@example.com',
        plan: 'free'
      }
    });
    
    console.log('Created client:', client);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 