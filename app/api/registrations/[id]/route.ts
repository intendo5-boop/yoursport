export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { id } = await params

    const registration = await prismaDirect.eventRegistration.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            eventDate: true,
            startTime: true,
            cancellationDeadlineHours: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 })
    }

    // Проверяем, что это запись текущего игрока
    if (registration.playerId !== session.userId) {
      return NextResponse.json(
        { error: "Это не ваша запись" },
        { status: 403 }
      )
    }

    if (registration.status === "cancelled") {
      return NextResponse.json(
        { error: "Запись уже отменена" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (status !== "cancelled") {
      return NextResponse.json(
        { error: "Недопустимый статус" },
        { status: 400 }
      )
    }

    // Проверка дедлайна отмены
    const [hours, minutes] = registration.event.startTime.split(":").map(Number)
    const eventDateTime = new Date(registration.event.eventDate)
    eventDateTime.setHours(hours, minutes ?? 0, 0, 0)

    const now = new Date()
    const hoursUntilEvent =
      (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilEvent < registration.event.cancellationDeadlineHours) {
      return NextResponse.json(
        {
          error: `Отмена недоступна. Отменить можно не позднее чем за ${registration.event.cancellationDeadlineHours}ч до начала.`,
        },
        { status: 400 }
      )
    }

    const updated = await prismaDirect.eventRegistration.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, registration: updated })
  } catch (error) {
    console.error("Cancel registration error:", error)
    return NextResponse.json(
      { error: "Не удалось отменить запись" },
      { status: 500 }
    )
  }
}