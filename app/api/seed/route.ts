export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prismaDirect } from "@/lib/prisma"

export async function POST() {
  try {
    const provider = await prismaDirect.user.findFirst({
      where: {
        roles: { some: { role: "provider" } },
      },
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Сначала зарегистрируйте провайдера" },
        { status: 400 }
      )
    }

    await prismaDirect.event.deleteMany({})
    await prismaDirect.venue.deleteMany({})

    const skyline = await prismaDirect.venue.create({
      data: {
        providerId: provider.id,
        name: "Skyline Volleyball Center",
        address: "18 Union Square, Downtown, Central City",
        city: "Central City",
        district: "Downtown",
        metro: "Union Square",
        sportTypes: ["volleyball"],
        surface: "Hardwood",
        pricePerHour: 32,
        photos: ["/venues/volleyball-indoor.png", "/venues/sports-arena.png"],
        description: "A premium indoor volleyball facility with three regulation courts.",
        amenities: ["Changing rooms", "Showers", "Parking"],
        nextSlot: "Today 18:00",
        isPublicForRent: true,
        moderationStatus: "approved",
      },
    })

    const riverside = await prismaDirect.venue.create({
      data: {
        providerId: provider.id,
        name: "Riverside Football Park",
        address: "5 Riverside Walk, Downtown, Central City",
        city: "Central City",
        district: "Downtown",
        metro: "Riverside",
        sportTypes: ["football"],
        surface: "Natural grass",
        pricePerHour: 48,
        photos: ["/venues/football-pitch.png"],
        description: "Full-size natural grass pitch with floodlights.",
        amenities: ["Floodlights", "Changing rooms", "Parking"],
        nextSlot: "Tomorrow 09:00",
        isPublicForRent: true,
        moderationStatus: "approved",
      },
    })

    const northgate = await prismaDirect.venue.create({
      data: {
        providerId: provider.id,
        name: "Northgate Arena",
        address: "72 North Park Ave, Northgate, Central City",
        city: "Central City",
        district: "Northgate",
        metro: "North Park",
        sportTypes: ["volleyball", "football"],
        surface: "Multi-surface",
        pricePerHour: 40,
        photos: ["/venues/sports-arena.png"],
        description: "A versatile multi-sport arena.",
        amenities: ["Changing rooms", "Showers", "Spectator seating"],
        nextSlot: "Today 20:00",
        isPublicForRent: true,
        moderationStatus: "approved",
      },
    })

    await prismaDirect.event.createMany({
      data: [
        {
          providerId: provider.id,
          venueId: skyline.id,
          type: "training",
          sportType: "volleyball",
          title: "Evening Volleyball Fundamentals",
          description: "A friendly, structured session focused on clean passing and consistent serving.",
          level: "B2",
          specializations: ["Passing & Reception", "Serving"],
          trainerName: "Marco Reyes",
          trainerExperience: "10 years coaching youth and adult volleyball.",
          trainerPhoto: "/trainers/coach-1.png",
          eventDate: new Date("2026-10-15"),
          startTime: "18:00",
          endTime: "19:30",
          price: 14,
          capacity: 12,
          registered: 9,
          registrationDeadlineHours: 3,
          cancellationDeadlineHours: 12,
          recurring: true,
        },
        {
          providerId: provider.id,
          venueId: riverside.id,
          type: "game",
          sportType: "football",
          title: "Sunday Football Match — 7-a-side",
          description: "Organized 7-a-side match with balanced teams, referees, and bibs provided.",
          level: "E1",
          specializations: ["Tactics & Positioning"],
          trainerName: "Diane Cole",
          trainerExperience: "UEFA B licensed coach with 8 years organizing leagues.",
          trainerPhoto: "/trainers/coach-2.png",
          eventDate: new Date("2026-10-20"),
          startTime: "11:00",
          endTime: "12:30",
          price: 12,
          capacity: 14,
          registered: 14,
          registrationDeadlineHours: 6,
          cancellationDeadlineHours: 24,
          recurring: false,
        },
        {
          providerId: provider.id,
          venueId: northgate.id,
          type: "training",
          sportType: "volleyball",
          title: "Competitive Volleyball League Night",
          description: "Full-length competitive 6v6 matches with rotation and refereeing.",
          level: "C2",
          specializations: ["Blocking", "Defense & Digging"],
          trainerName: "Marco Reyes",
          trainerExperience: "10 years coaching; runs the city's amateur evening league.",
          trainerPhoto: "/trainers/coach-1.png",
          eventDate: new Date("2026-10-22"),
          startTime: "20:00",
          endTime: "22:00",
          price: 18,
          capacity: 12,
          registered: 8,
          registrationDeadlineHours: 6,
          cancellationDeadlineHours: 24,
          recurring: true,
        },
      ],
    })

    return NextResponse.json({ success: true, venues: 3, events: 3 })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Ошибка при создании тестовых данных" },
      { status: 500 }
    )
  }
}