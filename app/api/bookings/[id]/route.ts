export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { id } = await params
    const url = new URL(request.url)
    const reason = url.searchParams.get("reason") || null

    const booking = await prismaDirect.booking.findUnique({
      where: { id },
      include: {
        venue: { select: { providerId: true, cancellationDeadlineHours: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Бронь не найдена" }, { status: 404 })
    }

    const isPlayer = booking.playerId === session.userId
    const isProvider = booking.venue.providerId === session.userId

    if (!isPlayer && !isProvider) {
      return NextResponse.json(
        { error: "Нет прав на отмену этой брони" },
        { status: 403 }
      )
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Можно отменить только подтверждённую бронь" },
        { status: 400 }
      )
    }

    // Проверка дедлайна — только для игрока. Провайдер может отменить в любой момент.
    if (isPlayer) {
      const bookingDate =
        typeof booking.date === "string"
          ? booking.date.slice(0, 10)
          : (booking.date as Date).toISOString().slice(0, 10)
      const startH = parseInt(booking.startTime.split(":")[0], 10)
      const startAt = new Date(`${bookingDate}T${String(startH).padStart(2, "0")}:00:00.000Z`)
      const now = new Date()
      const hoursUntilStart = (startAt.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilStart < booking.venue.cancellationDeadlineHours) {
        return NextResponse.json(
          {
            error: `Отмена возможна не позднее чем за ${booking.venue.cancellationDeadlineHours} ч. до начала`,
          },
          { status: 400 }
        )
      }
    }

    // Провайдер обязан указать причину
    if (isProvider && !reason) {
      return NextResponse.json(
        { error: "Провайдер обязан указать причину отмены" },
        { status: 400 }
      )
    }

    const updated = await prismaDirect.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        cancellationReason: reason,
        cancelledBy: isProvider ? "provider" : "player",
      },
    })

    // TODO (Этап 7.x): отправка email игроку, если отменил провайдер

    return NextResponse.json({ success: true, booking: updated })
  } catch (error) {
    console.error("Cancel booking error:", error)
    return NextResponse.json(
      { error: "Не удалось отменить бронь" },
      { status: 500 }
    )
  }
}