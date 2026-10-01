import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaDirect: PrismaClient | undefined
}

// Пул соединений через стандартный драйвер pg — обходит проблемы с pooler'ом Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 10000,
})

const poolDirect = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 10000,
})

const adapter = new PrismaPg(pool)
const adapterDirect = new PrismaPg(poolDirect)

// Основной клиент — быстрые запросы
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

// Клиент для сложных операций (Session mode)
export const prismaDirect =
  globalForPrisma.prismaDirect ??
  new PrismaClient({
    adapter: adapterDirect,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaDirect = prismaDirect
}