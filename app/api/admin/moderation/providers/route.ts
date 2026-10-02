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
    if (!session.roles.includes("admin")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 })
    }

    // Провайдеры в pending — это пользователи с ролью provider,
    // у которых providersInfo.moderationStatus = "pending"
    const providers = await prismaDirect.user.findMany({
      where: {
        roles: { some: { role: "provider" } },
        providerInfo: { moderationStatus: "pending" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        providerInfo: {
          select: {
            organizationName: true,
            description: true,
            phone: true,
            sportTypes: true,
            moderationStatus: true,
            createdAt: true,
          },
        },
        _count: {
          select: { venues: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ providers })
  } catch (error) {
    console.error("Fetch pending providers error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить провайдеров" },
      { status: 500 }
    )
  }
}