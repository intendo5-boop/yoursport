export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const events = await prismaDirect.event.findMany({
      where: {
        status: "active",
        // Показываем только события, у которых площадка одобрена.
        // Если площадка pending — событие не видно игрокам.
        venue: {
          moderationStatus: "approved",
        },
      },
      include: {
        venue: { select: { name: true } },
        trainer: true,
        _count: {
          select: {
            registrations: {
              where: { status: "confirmed" },
            },
          },
        },
      },
      orderBy: { eventDate: "asc" },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Fetch events error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить события" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }
    if (!session.roles.includes("provider")) {
      return NextResponse.json(
        { error: "Только провайдер может создавать события" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      venueId,
      trainerId,
      type,
      sport,
      title,
      description,
      level,
      specializations,
      date,
      startTime,
      endTime,
      price,
      capacity,
      registrationDeadlineHours,
      cancellationDeadlineHours,
      recurring,
    } = body

    if (!venueId || !type || !sport || !title || !date || !startTime || !endTime || !price || !capacity) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 }
      )
    }

    if (!trainerId) {
      return NextResponse.json(
        { error: "Выберите тренера" },
        { status: 400 }
      )
    }

    const venue = await prismaDirect.venue.findFirst({
      where: { id: venueId, providerId: session.userId },
    })

    if (!venue) {
      return NextResponse.json(
        { error: "Площадка не найдена или не принадлежит вам" },
        { status: 404 }
      )
    }

    const trainer = await prismaDirect.trainer.findFirst({
      where: { id: trainerId, providerId: session.userId },
    })

    if (!trainer) {
      return NextResponse.json(
        { error: "Тренер не найден или не принадлежит вам" },
        { status: 404 }
      )
    }

    const event = await prismaDirect.event.create({
      data: {
        providerId: session.userId,
        venueId,
        trainerId,
        type,
        sportType: sport,
        title,
        description: description || null,
        level: level || null,
        specializations: specializations ?? [],
        eventDate: new Date(date),
        startTime,
        endTime,
        price: Number(price),
        capacity: Number(capacity),
        registered: 0,
        registrationDeadlineHours: Number(registrationDeadlineHours ?? 3),
        cancellationDeadlineHours: Number(cancellationDeadlineHours ?? 12),
        recurring: Boolean(recurring),
        status: "active",
      },
    })

    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json(
      { error: "Не удалось создать событие" },
      { status: 500 }
    )
  }
}