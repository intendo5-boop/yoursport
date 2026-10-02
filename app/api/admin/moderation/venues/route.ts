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
    if (!session.roles.includes("admin")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 })
    }

    const venues = await prismaDirect.venue.findMany({
      where: { moderationStatus: "pending" },
      include: {
        provider: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ venues })
  } catch (error) {
    console.error("Fetch pending venues error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить площадки" },
      { status: 500 }
    )
  }
}