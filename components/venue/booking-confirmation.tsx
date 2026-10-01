"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CircleCheck, MapPin, Clock, CalendarDays, Phone, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { SportBadge } from "@/components/sport-badge"
import { VENUES } from "@/lib/mock-data"

export function BookingConfirmation() {
  const params = useSearchParams()
  const venue = VENUES.find((v) => v.id === params.get("venue")) ?? VENUES[0]
  const slot = params.get("slot") ?? "18:00"
  const duration = Number(params.get("duration") ?? "1")
  const total = params.get("total") ?? String(venue.pricePerHour)
  const ref = `RLY-${(venue.id + slot).replace(/\D/g, "").padStart(4, "0").slice(-4)}${duration}8`

  const endHour = String(Number(slot.split(":")[0]) + duration).padStart(2, "0")

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CircleCheck className="size-9 text-primary" strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Booking requested</h1>
        <p className="text-pretty text-muted-foreground">
          We&apos;ve sent your request to {venue.providerName}. You&apos;ll get a confirmation once
          they approve it — usually within an hour.
        </p>
      </div>

      <Card className="w-full overflow-hidden p-0 text-left">
        <div className="flex items-center justify-between border-b border-dashed border-border bg-muted/40 px-5 py-3">
          <span className="text-sm text-muted-foreground">Reference</span>
          <span className="font-mono text-sm font-semibold">{ref}</span>
        </div>
        <div className="flex gap-3 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.images[0] || "/placeholder.svg"}
            alt={venue.name}
            className="size-20 shrink-0 rounded-xl object-cover"
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap gap-1.5">
              {venue.sports.map((s) => (
                <SportBadge key={s} sport={s} />
              ))}
            </div>
            <p className="text-lg font-semibold leading-tight">{venue.name}</p>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {venue.address}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden border-t border-border bg-border text-sm">
          <Detail icon={<CalendarDays className="size-4" />} label="Date" value="Today" />
          <Detail
            icon={<Clock className="size-4" />}
            label="Time"
            value={`${slot} – ${endHour}:00 (${duration}h)`}
          />
          <Detail icon={<Phone className="size-4" />} label="Provider" value={venue.providerPhone} />
          <Detail icon={<CircleCheck className="size-4" />} label="Total paid" value={`$${total}`} />
        </dl>
      </Card>

      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <ButtonLink href="/dashboard" size="lg" className="h-11 flex-1">
          View my bookings
        </ButtonLink>
        <Button variant="outline" size="lg" className="h-11 flex-1">
          <Download className="size-4" />
          Download receipt
        </Button>
      </div>
      <Link href="/venues" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Book another venue
      </Link>
    </div>
  )
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-card px-5 py-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
