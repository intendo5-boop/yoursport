import { notFound } from "next/navigation"
import { PlayerShell } from "@/components/shells/player-shell"
import { EventDetail } from "@/components/event/event-detail"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { adaptEvent } from "@/lib/adapters"

export const runtime = "nodejs"

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  const dbEvent = await prismaDirect.event.findUnique({
    where: { id },
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

  // Проверка: записан ли текущий пользователь
  let isRegistered = false
  if (session) {
    const reg = await prismaDirect.eventRegistration.findUnique({
      where: {
        eventId_playerId: {
          eventId: id,
          playerId: session.userId,
        },
      },
    })
    isRegistered = reg?.status === "confirmed"
  }

  const event = adaptEvent({
    ...dbEvent,
    registered: dbEvent._count.registrations,
  })

  const isProvider =
    session?.roles.includes("provider") === true &&
    dbEvent.providerId === session.userId

  return (
    <PlayerShell>
      <EventDetail
        event={event}
        isAuthenticated={Boolean(session)}
        isRegistered={isRegistered}
        isProvider={isProvider}
      />
    </PlayerShell>
  )
}