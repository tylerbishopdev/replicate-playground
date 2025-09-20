/**
 * Database client utility
 * Provides Prisma client instance and database operations
 */

import { PrismaClient } from './generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Generation-related database operations
export const db = {
  // Create a new generation record
  createGeneration: async (data: {
    modelOwner: string;
    modelName: string;
    modelVersion?: string;
    prompt: string;
    parameters?: any;
    replicateId?: string;
  }) => {
    return prisma.generation.create({
      data: {
        ...data,
        status: 'PENDING',
        startedAt: new Date(),
      },
    });
  },

  // Update generation status
  updateGeneration: async (id: string, data: {
    status?: 'PENDING' | 'STARTING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
    output?: any;
    imageUrls?: string[];
    blobUrls?: string[];
    error?: string;
    completedAt?: Date;
    duration?: number;
  }) => {
    return prisma.generation.update({
      where: { id },
      data,
    });
  },

  // Update generation by Replicate ID
  updateGenerationByReplicateId: async (replicateId: string, data: {
    status?: 'PENDING' | 'STARTING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
    output?: any;
    imageUrls?: string[];
    blobUrls?: string[];
    error?: string;
    completedAt?: Date;
    duration?: number;
  }) => {
    return prisma.generation.update({
      where: { replicateId },
      data,
    });
  },

  // Get generation by ID
  getGeneration: async (id: string) => {
    return prisma.generation.findUnique({
      where: { id },
    });
  },

  // Get generation by Replicate ID
  getGenerationByReplicateId: async (replicateId: string) => {
    return prisma.generation.findUnique({
      where: { replicateId },
    });
  },

  // Get all generations for a model
  getGenerationsForModel: async (modelOwner: string, modelName: string) => {
    return prisma.generation.findMany({
      where: {
        modelOwner,
        modelName,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Get recent generations
  getRecentGenerations: async (limit = 10) => {
    return prisma.generation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  },

  // Get generation statistics
  getGenerationStats: async () => {
    const total = await prisma.generation.count();
    const successful = await prisma.generation.count({
      where: { status: 'SUCCEEDED' },
    });
    const failed = await prisma.generation.count({
      where: { status: 'FAILED' },
    });
    const pending = await prisma.generation.count({
      where: {
        status: {
          in: ['PENDING', 'STARTING', 'PROCESSING']
        }
      },
    });

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? successful / total : 0,
    };
  },
};

export default prisma;