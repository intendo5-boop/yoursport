export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const venues = await prismaDirect.venue.findMany({
      where: {
        moderationStatus: "approved",
        isPublicForRent: true,
      },
      include: {
        provider: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ venues })
  } catch (error) {
    console.error("Fetch venues error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить площадки" },
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
      return NextResponse.json({ error: "Только провайдер может создавать площадки" }, { status: 403 })
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

    if (!name || !address || !city || !sports?.length || !pricePerHour) {
      return NextResponse.json(
        { error: "Заполните обязательные поля: название, адрес, город, вид спорта, цену" },
        { status: 400 }
      )
    }

    const venue = await prismaDirect.venue.create({
      data: {
        providerId: session.userId,
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
        moderationStatus: "approved",
      },
    })

    return NextResponse.json({ success: true, venue }, { status: 201 })
  } catch (error) {
    console.error("Create venue error:", error)
    return NextResponse.json(
      { error: "Не удалось создать площадку" },
      { status: 500 }
    )
  }
}