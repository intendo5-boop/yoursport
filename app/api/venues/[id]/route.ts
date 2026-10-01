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

    const venue = await prismaDirect.venue.findUnique({
      where: { id },
      include: {
        provider: {
          select: { name: true, phone: true },
        },
      },
    })

    if (!venue) {
      return NextResponse.json({ error: "Площадка не найдена" }, { status: 404 })
    }

    return NextResponse.json({ venue })
  } catch (error) {
    console.error("Fetch venue error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить площадку" },
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
      return NextResponse.json({ error: "Только провайдер" }, { status: 403 })
    }

    const { id } = await params

    const existing = await prismaDirect.venue.findFirst({
      where: { id, providerId: session.userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Площадка не найдена или не принадлежит вам" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      sports,
      city,
      metro,
      address,
      surface,
      pricePerHour,
      publicBooking,
      amenities,
      photos,
      cancellationDeadlineHours,
    } = body

    const updated = await prismaDirect.venue.update({
      where: { id },
      data: {
        name,
        description: description || null,
        sportTypes: sports,
        city,
        metro: metro || null,
        address,
        surface: surface || null,
        pricePerHour: Number(pricePerHour),
        isPublicForRent: Boolean(publicBooking),
        amenities: amenities ?? [],
        photos: photos ?? [],
        cancellationDeadlineHours: Number(cancellationDeadlineHours ?? 12),
      },
    })

    return NextResponse.json({ success: true, venue: updated })
  } catch (error) {
    console.error("Update venue error:", error)
    return NextResponse.json(
      { error: "Не удалось обновить площадку" },
      { status: 500 }
    )
  }
}