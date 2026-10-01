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
    if (!session.roles.includes("provider")) {
      return NextResponse.json(
        { error: "Только провайдер имеет доступ" },
        { status: 403 }
      )
    }

    const trainers = await prismaDirect.trainer.findMany({
      where: { providerId: session.userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ trainers })
  } catch (error) {
    console.error("Fetch trainers error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить тренеров" },
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
        { error: "Только провайдер может создавать тренеров" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, experience, photo } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Введите имя тренера" },
        { status: 400 }
      )
    }

    const trainer = await prismaDirect.trainer.create({
      data: {
        providerId: session.userId,
        name: name.trim(),
        experience: experience?.trim() || null,
        photo: photo || null,
      },
    })

    return NextResponse.json({ success: true, trainer }, { status: 201 })
  } catch (error) {
    console.error("Create trainer error:", error)
    return NextResponse.json(
      { error: "Не удалось создать тренера" },
      { status: 500 }
    )
  }
}