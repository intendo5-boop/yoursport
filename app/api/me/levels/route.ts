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

    const levels = await prismaDirect.playerSportLevel.findMany({
      where: { userId: session.userId },
    })

    return NextResponse.json({ levels })
  } catch (error) {
    console.error("Fetch my levels error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить уровни" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { levels } = body as {
      levels: Array<{ sportType: string; level: string }>
    }

    if (!Array.isArray(levels)) {
      return NextResponse.json(
        { error: "Некорректный формат данных" },
        { status: 400 }
      )
    }

    // Валидация
    for (const item of levels) {
      if (!item.sportType || !item.level) {
        return NextResponse.json(
          { error: "Каждый уровень должен иметь sportType и level" },
          { status: 400 }
        )
      }
      if (!["volleyball", "football"].includes(item.sportType)) {
        return NextResponse.json(
          { error: `Неподдерживаемый вид спорта: ${item.sportType}` },
          { status: 400 }
        )
      }
    }

    // Без транзакции — последовательно.
    // Сначала удаляем старые уровни, потом создаём новые.
    await prismaDirect.playerSportLevel.deleteMany({
      where: { userId: session.userId },
    })

    for (const item of levels) {
      await prismaDirect.playerSportLevel.create({
        data: {
          userId: session.userId,
          sportType: item.sportType,
          level: item.level,
        },
      })
    }

    const saved = await prismaDirect.playerSportLevel.findMany({
      where: { userId: session.userId },
    })

    return NextResponse.json({ success: true, levels: saved })
  } catch (error) {
    console.error("Save levels error:", error)
    return NextResponse.json(
      { error: "Не удалось сохранить уровни" },
      { status: 500 }
    )
  }
}