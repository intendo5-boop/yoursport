import { notFound } from "next/navigation"
import { ProviderShell } from "@/components/shells/provider-shell"
import { VenueForm } from "@/components/provider/venue-form"
import { PROVIDER_VENUES } from "@/lib/mock-data"

export function generateStaticParams() {
  return PROVIDER_VENUES.map((v) => ({ id: v.id }))
}

export default async function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const venue = PROVIDER_VENUES.find((v) => v.id === id)
  if (!venue) notFound()

  return (
    <ProviderShell>
      <VenueForm venue={venue} />
    </ProviderShell>
  )
}
