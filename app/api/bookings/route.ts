export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { venueId, date, startTime, durationHours, comment } = body

    if (!venueId || !date || !startTime || !durationHours) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 }
      )
    }

    const venue = await prismaDirect.venue.findUnique({
      where: { id: venueId },
    })

    if (!venue) {
      return NextResponse.json({ error: "Площадка не найдена" }, { status: 404 })
    }

    // end time = startTime + durationHours
    const startH = parseInt(startTime.split(":")[0], 10)
    const endH = startH + Number(durationHours)
    if (endH > 23) {
      return NextResponse.json(
        { error: "Бронь выходит за пределы рабочего времени" },
        { status: 400 }
      )
    }
    const endTime = `${String(endH).padStart(2, "0")}:00`

    // Проверка пересечения с другими бронями и событиями
    const dayStart = new Date(date + "T00:00:00.000Z")
    const dayEnd = new Date(date + "T23:59:59.999Z")

    const existingBookings = await prismaDirect.booking.findMany({
      where: {
        venueId,
        date: { gte: dayStart, lte: dayEnd },
        status: "confirmed",
      },
    })

    for (const b of existingBookings) {
      const bStart = parseInt(b.startTime.split(":")[0], 10)
      const bEnd = parseInt(b.endTime.split(":")[0], 10)
      if (startH < bEnd && endH > bStart) {
        return NextResponse.json(
          { error: "Выбранное время пересекается с существующей бронью" },
          { status: 409 }
        )
      }
    }

    const existingEvents = await prismaDirect.event.findMany({
      where: {
        venueId,
        eventDate: { gte: dayStart, lte: dayEnd },
        status: "active",
      },
    })

    for (const e of existingEvents) {
      const eStart = parseInt(e.startTime.split(":")[0], 10)
      const eEnd = parseInt(e.endTime.split(":")[0], 10)
      if (startH < eEnd && endH > eStart) {
        return NextResponse.json(
          { error: "Выбранное время пересекается с событием на площадке" },
          { status: 409 }
        )
      }
    }

    const totalPrice = Number(venue.pricePerHour) * Number(durationHours)

    const booking = await prismaDirect.booking.create({
      data: {
        venueId,
        playerId: session.userId,
        date: new Date(date),
        startTime,
        endTime,
        durationHours: Number(durationHours),
        status: "confirmed",
        comment: comment || null,
        totalPrice,
      },
    })

    return NextResponse.json({ success: true, booking }, { status: 201 })
  } catch (error) {
    console.error("Create booking error:", error)
    return NextResponse.json(
      { error: "Не удалось создать бронь" },
      { status: 500 }
    )
  }
}