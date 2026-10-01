import Link from "next/link"
import { MapPin, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SportBadge } from "@/components/sport-badge"
import type { Venue } from "@/lib/types"

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link href={`/venues/${venue.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.images[0] || "/placeholder.svg"}
            alt={venue.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            {venue.sports.map((s) => (
              <SportBadge key={s} sport={s} size="sm" />
            ))}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-sm font-semibold shadow-sm backdrop-blur">
            ${venue.pricePerHour}
            <span className="font-normal text-muted-foreground">/hr</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h3 className="font-semibold leading-tight group-hover:text-primary">{venue.name}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {venue.district}, {venue.city} · {venue.metro}
          </p>
          <div className="mt-1 flex items-center gap-1.5 border-t border-border pt-3 text-sm">
            <Clock className="size-4 text-primary" />
            <span className="text-muted-foreground">Next slot</span>
            <span className="ml-auto font-medium">{venue.nextSlot}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}