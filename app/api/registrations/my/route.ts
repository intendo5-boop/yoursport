export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { adaptMyRegistration } from "@/lib/adapters"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const registrations = await prismaDirect.eventRegistration.findMany({
      where: { playerId: session.userId },
      include: {
        event: {
          select: {
            title: true,
            sportType: true,
            type: true,
            eventDate: true,
            startTime: true,
            endTime: true,
            price: true,
            registrationDeadlineHours: true,
            cancellationDeadlineHours: true,
            venue: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const adapted = registrations.map(adaptMyRegistration)

    return NextResponse.json({ registrations: adapted })
  } catch (error) {
    console.error("Fetch my registrations error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить ваши записи" },
      { status: 500 }
    )
  }
}