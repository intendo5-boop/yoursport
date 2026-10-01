export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prismaDirect.event.findUnique({
      where: { id },
      include: {
        venue: { select: { name: true } },
        trainer: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Fetch event error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить событие" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }
    if (!session.roles.includes("provider")) {
      return NextResponse.json(
        { error: "Только провайдер может редактировать события" },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prismaDirect.event.findFirst({
      where: { id, providerId: session.userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Событие не найдено или не принадлежит вам" },
        { status: 404 }
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

    if (Number(capacity) < existing.registered) {
      return NextResponse.json(
        { error: `Нельзя установить лимит меньше уже записанных (${existing.registered})` },
        { status: 400 }
      )
    }

    const updated = await prismaDirect.event.update({
      where: { id },
      data: {
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
        registrationDeadlineHours: Number(registrationDeadlineHours ?? 3),
        cancellationDeadlineHours: Number(cancellationDeadlineHours ?? 12),
        recurring: Boolean(recurring),
      },
    })

    return NextResponse.json({ success: true, event: updated })
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json(
      { error: "Не удалось обновить событие" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }
    if (!session.roles.includes("provider")) {
      return NextResponse.json(
        { error: "Только провайдер может удалять события" },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prismaDirect.event.findFirst({
      where: { id, providerId: session.userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Событие не найдено или не принадлежит вам" },
        { status: 404 }
      )
    }

    await prismaDirect.event.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json(
      { error: "Не удалось удалить событие" },
      { status: 500 }
    )
  }
}