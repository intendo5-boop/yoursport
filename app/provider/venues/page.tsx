"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Plus, MapPin, Pencil, Eye, EyeOff, Loader2 } from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { SportBadge } from "@/components/sport-badge"
import { ModerationBadge } from "@/components/status-badge"
import { adaptVenue } from "@/lib/adapters"
import type { Venue } from "@/lib/types"

export default function ProviderVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/venues/my")
        const data = await res.json()
        if (!cancelled && data.venues) {
          setVenues(data.venues.map(adaptVenue))
        }
      } catch (err) {
        console.error("Load my venues error:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">My venues</h1>
            <p className="text-muted-foreground">Manage your listings, pricing, and availability.</p>
          </div>
          <ButtonLink href="/provider/venues/new">
            <Plus className="size-4" />
            Add venue
          </ButtonLink>
        </div>

        {loading ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading venues...</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {venues.map((v) => (
              <Card key={v.id} className="flex flex-col overflow-hidden p-0">
                <div className="relative aspect-[16/9] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.images[0] || "/placeholder.svg"} alt={v.name} className="size-full object-cover" />
                  <div className="absolute left-3 top-3">
                    <ModerationBadge status={v.moderationStatus} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {v.sports.map((s) => (
                      <SportBadge key={s} sport={s} />
                    ))}
                    <Badge variant={v.publicBooking ? "success" : "neutral"}>
                      {v.publicBooking ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      {v.publicBooking ? "Public booking" : "Request only"}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold leading-tight">{v.name}</h3>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {v.address}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm">
                      <span className="text-lg font-bold">${v.pricePerHour}</span>
                      <span className="text-muted-foreground">/hr</span>
                    </span>
                    <ButtonLink href={`/provider/venues/${v.id}`} variant="outline" size="sm">
                      <Pencil className="size-3.5" />
                      Edit
                    </ButtonLink>
                  </div>
                </div>
              </Card>
            ))}

            <Link
              href="/provider/venues/new"
              className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Building2 className="size-6 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">Add another venue</span>
                <span className="text-sm text-muted-foreground">List a new court or pitch</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </ProviderShell>
  )
}