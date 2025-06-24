import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Handle process termination gracefully
if (process.env.NODE_ENV !== 'production') {
  // Remove any existing listeners to avoid MaxListenersExceededWarning
  process.removeAllListeners('beforeExit')
  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTERM')
  
  // Add single exit handler
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error during Prisma cleanup:', error)
    }
  }
  
  process.once('beforeExit', cleanup)
  process.once('SIGINT', cleanup)
  process.once('SIGTERM', cleanup)
} 