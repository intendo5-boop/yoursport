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

    const events = await prismaDirect.event.findMany({
      where: { providerId: session.userId },
      include: {
        venue: { select: { name: true } },
        trainer: true,
      },
      orderBy: { eventDate: "desc" },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Fetch my events error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить события" },
      { status: 500 }
    )
  }
}