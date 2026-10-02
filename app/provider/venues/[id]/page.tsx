import { notFound, redirect } from "next/navigation"
import { prismaDirect } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { adaptVenue } from "@/lib/adapters"
import { VenueForm } from "@/components/provider/venue-form"

export const runtime = "nodejs"

export default async function EditVenuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.roles.includes("provider")) redirect("/dashboard")

  const { id } = await params

  const dbVenue = await prismaDirect.venue.findFirst({
    where: { id, providerId: session.userId },
    include: {
      provider: {
        select: { name: true, phone: true },
      },
    },
  })

  if (!dbVenue) notFound()

  const venue = adaptVenue(dbVenue)

  return <VenueForm venue={venue} />
}