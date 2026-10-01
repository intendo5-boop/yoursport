import { notFound, redirect } from "next/navigation"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { adaptEvent, adaptRegistration } from "@/lib/adapters"
import { EventView } from "@/components/provider/event-view"
import type { Sport } from "@/lib/types"

export const runtime = "nodejs"

export default async function ViewEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.roles.includes("provider")) redirect("/dashboard")

  const { id } = await params

  const dbEvent = await prismaDirect.event.findFirst({
    where: { id, providerId: session.userId },
    include: {
      venue: { select: { name: true } },
      trainer: true,
      _count: {
        select: {
          registrations: {
            where: { status: "confirmed" },
          },
        },
      },
    },
  })

  if (!dbEvent) notFound()

  // Получаем список записавшихся
  const dbRegistrations = await prismaDirect.eventRegistration.findMany({
    where: { eventId: id, status: "confirmed" },
    include: {
      player: {
        select: {
          name: true,
          email: true,
          phone: true,
          sportLevels: {
            select: { sportType: true, level: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const event = adaptEvent({
    ...dbEvent,
    registered: dbEvent._count.registrations,
  })

  const registrations = dbRegistrations.map((r) =>
    adaptRegistration(r, dbEvent.sportType as Sport)
  )

  return <EventView event={event} registrations={registrations} />
}