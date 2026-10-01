import { notFound, redirect } from "next/navigation"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { adaptEvent } from "@/lib/adapters"
import { EventForm } from "@/components/provider/event-form"

export const runtime = "nodejs"

export default async function EditEventPage({
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
    },
  })

  if (!dbEvent) notFound()

  const event = adaptEvent(dbEvent)

  return <EventForm event={event} />
}