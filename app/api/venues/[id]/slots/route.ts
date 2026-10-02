export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: venueId } = await params
    const url = new URL(request.url)
    const dateParam = url.searchParams.get("date")

    if (!dateParam) {
      return NextResponse.json(
        { error: "Параметр date обязателен" },
        { status: 400 }
      )
    }

    // Начало и конец дня
    const dayStart = new Date(dateParam + "T00:00:00.000Z")
    const dayEnd = new Date(dateParam + "T23:59:59.999Z")

    // Занятые слоты из bookings (confirmed)
    const bookings = await prismaDirect.booking.findMany({
      where: {
        venueId,
        date: { gte: dayStart, lte: dayEnd },
        status: "confirmed",
      },
      select: { startTime: true, endTime: true },
    })

    // Занятые слоты из events на эту дату
    const events = await prismaDirect.event.findMany({
      where: {
        venueId,
        eventDate: { gte: dayStart, lte: dayEnd },
        status: "active",
      },
      select: { startTime: true, endTime: true },
    })

    // Формируем список занятых часов (08:00–23:00)
    const occupiedHours = new Set<string>()

    // Функция через const + стрелка — не вызывает ошибку strict mode ES5
    const markOccupied = (start: string, end: string) => {
      const startH = parseInt(start.split(":")[0], 10)
      const endH = parseInt(end.split(":")[0], 10)
      for (let h = startH; h < endH; h++) {
        occupiedHours.add(`${String(h).padStart(2, "0")}:00`)
      }
    }

    for (const b of bookings) markOccupied(b.startTime, b.endTime)
    for (const e of events) markOccupied(e.startTime, e.endTime)

    const slots = []
    for (let h = 8; h <= 22; h++) {
      const time = `${String(h).padStart(2, "0")}:00`
      slots.push({
        time,
        status: occupiedHours.has(time) ? "booked" : "available",
      })
    }

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Fetch slots error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить слоты" },
      { status: 500 }
    )
  }
}