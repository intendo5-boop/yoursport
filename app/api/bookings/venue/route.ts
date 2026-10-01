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
    if (!session.roles.includes("provider")) {
      return NextResponse.json({ error: "Только для провайдера" }, { status: 403 })
    }

    const bookings = await prismaDirect.booking.findMany({
      where: {
        venue: { providerId: session.userId },
      },
      include: {
        venue: { select: { name: true, sportTypes: true } },
        player: { select: { name: true, phone: true } },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Fetch venue bookings error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить брони" },
      { status: 500 }
    )
  }
}