export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const venues = await prismaDirect.venue.findMany({
      where: { providerId: session.userId },
      include: {
        provider: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ venues })
  } catch (error) {
    console.error("Fetch my venues error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить площадки" },
      { status: 500 }
    )
  }
}