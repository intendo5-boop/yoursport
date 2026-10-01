export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { adaptRegistration } from "@/lib/adapters"
import type { Sport } from "@/lib/types"

// GET — список записавшихся. Доступен только владельцу события (провайдеру).
// Для игроков — возвращает количество.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()

    const event = await prismaDirect.event.findUnique({
      where: { id },
      select: { id: true, providerId: true, sportType: true, capacity: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 })
    }

    const isOwner = session?.userId === event.providerId

    // Игрок (или аноним) — только счётчик
    if (!isOwner) {
      const count = await prismaDirect.eventRegistration.count({
        where: { eventId: id, status: "confirmed" },
      })
      return NextResponse.json({
        count,
        capacity: event.capacity,
        registrations: null,
      })
    }

    // Провайдер — полный список
    const registrations = await prismaDirect.eventRegistration.findMany({
      where: { eventId: id, status: "confirmed" },
      include: {
        player: {
          select: {
            name: true,
            email: true,
            phone: true,
            sportLevels: {
              select: { sportType: true, level: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    const adapted = registrations.map((r) =>
      adaptRegistration(r, event.sportType as Sport)
    )

    return NextResponse.json({
      count: adapted.length,
      capacity: event.capacity,
      registrations: adapted,
    })
  } catch (error) {
    console.error("Fetch registrations error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить список записавшихся" },
      { status: 500 }
    )
  }
}

// POST — записаться на событие
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const { id } = await params

    const event = await prismaDirect.event.findUnique({
      where: { id },
      select: {
        id: true,
        capacity: true,
        sportType: true,
        eventDate: true,
        startTime: true,
        registrationDeadlineHours: true,
        status: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Событие не найдено" }, { status: 404 })
    }

    if (event.status !== "active") {
      return NextResponse.json(
        { error: "Событие больше не активно" },
        { status: 400 }
      )
    }

    // Проверка, что игрок не провайдер самого события
    if (session.userId === (event as any).providerId) {
      return NextResponse.json(
        { error: "Вы не можете записаться на своё событие" },
        { status: 400 }
      )
    }

    // Проверка дедлайна записи
    const [hours, minutes] = event.startTime.split(":").map(Number)
    const eventDateTime = new Date(event.eventDate)
    eventDateTime.setHours(hours, minutes ?? 0, 0, 0)
    const now = new Date()
    const hoursUntilEvent =
      (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilEvent < event.registrationDeadlineHours) {
      return NextResponse.json(
        {
          error: `Запись закрыта. Регистрация закрывается за ${event.registrationDeadlineHours}ч до начала.`,
        },
        { status: 400 }
      )
    }

    // Проверка профиля — city + уровень по виду спорта
    const user = await prismaDirect.user.findUnique({
      where: { id: session.userId },
      select: {
        city: true,
        sportLevels: {
          where: { sportType: event.sportType },
          select: { level: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    if (!user.city) {
      return NextResponse.json(
        {
          error:
            "Заполните профиль — укажите город, чтобы записаться на тренировки.",
          code: "PROFILE_INCOMPLETE",
        },
        { status: 403 }
      )
    }

    if (user.sportLevels.length === 0) {
      return NextResponse.json(
        {
          error: `Укажите свой уровень по виду спорта, чтобы записаться.`,
          code: "LEVEL_REQUIRED",
        },
        { status: 403 }
      )
    }

    // Проверка, что игрок ещё не записан
    const existing = await prismaDirect.eventRegistration.findUnique({
      where: {
        eventId_playerId: {
          eventId: id,
          playerId: session.userId,
        },
      },
    })

    if (existing) {
      if (existing.status === "confirmed") {
        return NextResponse.json(
          { error: "Вы уже записаны на это событие" },
          { status: 409 }
        )
      }
      // Если запись была отменена — реактивируем
      const reactivated = await prismaDirect.eventRegistration.update({
        where: { id: existing.id },
        data: {
          status: "confirmed",
          cancelledAt: null,
        },
      })
      return NextResponse.json({ success: true, registration: reactivated })
    }

    // Проверка лимита участников (с блокировкой через транзакцию)
    const confirmedCount = await prismaDirect.eventRegistration.count({
      where: { eventId: id, status: "confirmed" },
    })

    if (confirmedCount >= event.capacity) {
      return NextResponse.json(
        { error: "Свободных мест не осталось" },
        { status: 409 }
      )
    }

    const registration = await prismaDirect.eventRegistration.create({
      data: {
        eventId: id,
        playerId: session.userId,
        status: "confirmed",
      },
    })

    return NextResponse.json(
      { success: true, registration },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register to event error:", error)
    return NextResponse.json(
      { error: "Не удалось записаться на событие" },
      { status: 500 }
    )
  }
}