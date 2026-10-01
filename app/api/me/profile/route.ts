export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { city, photoUrl, name } = body

    if (!city || !city.trim()) {
      return NextResponse.json(
        { error: "Укажите город" },
        { status: 400 }
      )
    }

    const updated = await prismaDirect.user.update({
      where: { id: session.userId },
      data: {
        city: city.trim(),
        photoUrl: photoUrl || null,
        ...(name && name.trim() ? { name: name.trim() } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        photoUrl: true,
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Не удалось сохранить профиль" },
      { status: 500 }
    )
  }
}