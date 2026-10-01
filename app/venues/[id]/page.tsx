import { notFound } from "next/navigation"
import { PlayerShell } from "@/components/shells/player-shell"
import { VenueDetail } from "@/components/venue/venue-detail"
import { prisma } from "@/lib/prisma"
import { adaptVenue } from "@/lib/adapters"

export const runtime = "nodejs"

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const dbVenue = await prisma.venue.findUnique({
    where: { id },
    include: {
      provider: {
        select: { name: true, phone: true },
      },
    },
  })

  if (!dbVenue) notFound()

  const venue = adaptVenue(dbVenue)

  return (
    <PlayerShell>
      <VenueDetail venue={venue} />
    </PlayerShell>
  )
}