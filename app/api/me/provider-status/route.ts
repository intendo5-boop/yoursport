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
      return NextResponse.json({ isProvider: false })
    }

    const providerInfo = await prismaDirect.providerInfo.findUnique({
      where: { userId: session.userId },
      select: {
        moderationStatus: true,
        rejectionReason: true,
        moderatedAt: true,
      },
    })

    if (!providerInfo) {
      return NextResponse.json({
        isProvider: true,
        moderationStatus: "pending",
        rejectionReason: null,
      })
    }

    return NextResponse.json({
      isProvider: true,
      moderationStatus: providerInfo.moderationStatus,
      rejectionReason: providerInfo.rejectionReason,
      moderatedAt: providerInfo.moderatedAt,
    })
  } catch (error) {
    console.error("Fetch provider status error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить статус" },
      { status: 500 }
    )
  }
}