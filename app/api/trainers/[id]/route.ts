export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
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
        { error: "Только провайдер имеет доступ" },
        { status: 403 }
      )
    }

    const { id } = await params

    const trainer = await prismaDirect.trainer.findFirst({
      where: { id, providerId: session.userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Тренер не найден" }, { status: 404 })
    }

    return NextResponse.json({ trainer })
  } catch (error) {
    console.error("Fetch trainer error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить тренера" },
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
        { error: "Только провайдер может редактировать тренеров" },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prismaDirect.trainer.findFirst({
      where: { id, providerId: session.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Тренер не найден" }, { status: 404 })
    }

    const body = await request.json()
    const { name, experience, photo } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Введите имя тренера" },
        { status: 400 }
      )
    }

    const trainer = await prismaDirect.trainer.update({
      where: { id },
      data: {
        name: name.trim(),
        experience: experience?.trim() || null,
        photo: photo || null,
      },
    })

    return NextResponse.json({ success: true, trainer })
  } catch (error) {
    console.error("Update trainer error:", error)
    return NextResponse.json(
      { error: "Не удалось обновить тренера" },
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
        { error: "Только провайдер может удалять тренеров" },
        { status: 403 }
      )
    }

    const { id } = await params

    const existing = await prismaDirect.trainer.findFirst({
      where: { id, providerId: session.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Тренер не найден" }, { status: 404 })
    }

    // Проверяем, есть ли события с этим тренером
    const eventCount = await prismaDirect.event.count({
      where: { trainerId: id },
    })

    if (eventCount > 0) {
      return NextResponse.json(
        {
          error: `Тренер назначен на ${eventCount} ${eventCount === 1 ? "событие" : "событий"}. Сначала замените тренера в этих событиях на другого или удалите события.`,
          eventCount,
        },
        { status: 409 }
      )
    }

    await prismaDirect.trainer.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete trainer error:", error)
    return NextResponse.json(
      { error: "Не удалось удалить тренера" },
      { status: 500 }
    )
  }
}