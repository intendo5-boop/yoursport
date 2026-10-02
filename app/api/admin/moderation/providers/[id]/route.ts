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
    if (!session.roles.includes("admin")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, reason } = body

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "Недопустимый статус. Используйте approved или rejected" },
        { status: 400 }
      )
    }

    if (status === "rejected" && !reason?.trim()) {
      return NextResponse.json(
        { error: "Укажите причину отклонения" },
        { status: 400 }
      )
    }

    const existing = await prismaDirect.providerInfo.findUnique({
      where: { userId: id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Провайдер не найден" },
        { status: 404 }
      )
    }

    const updated = await prismaDirect.providerInfo.update({
      where: { userId: id },
      data: {
        moderationStatus: status,
        rejectionReason: status === "rejected" ? reason.trim() : null,
        moderatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, provider: updated })
  } catch (error) {
    console.error("Moderate provider error:", error)
    return NextResponse.json(
      { error: "Не удалось обновить статус провайдера" },
      { status: 500 }
    )
  }
}