"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Check,
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  Clock,
  CircleCheck,
} from "lucide-react"
import { AdminShell } from "@/components/shells/admin-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SportBadge } from "@/components/sport-badge"
import { PENDING_PROVIDERS, PENDING_VENUES } from "@/lib/mock-data"

type Decision = "pending" | "approved" | "rejected"

export default function ModerationPage() {
  const [providerDecisions, setProviderDecisions] = useState<Record<string, Decision>>({})
  const [venueDecisions, setVenueDecisions] = useState<Record<string, Decision>>({})

  const pendingProviders = PENDING_PROVIDERS.filter(
    (p) => (providerDecisions[p.id] ?? "pending") === "pending",
  )
  const pendingVenues = PENDING_VENUES.filter((v) => (venueDecisions[v.id] ?? "pending") === "pending")

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Moderation queue</h1>
            <p className="text-muted-foreground">Review and approve new providers and venue listings.</p>
          </div>
        </div>

        <Tabs defaultValue="providers">
          <TabsList>
            <TabsTrigger value="providers">Providers ({pendingProviders.length})</TabsTrigger>
            <TabsTrigger value="venues">Venues ({pendingVenues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="mt-4">
            {pendingProviders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingProviders.map((p) => (
                  <Card key={p.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <Avatar name={p.name} className="size-12" />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.name}</span>
                        <Badge variant="neutral">
                          <Building2 className="size-3" />
                          {p.venuesCount} venues
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5" />
                          {p.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5" />
                          {p.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          Submitted {p.submitted}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setProviderDecisions((d) => ({ ...d, [p.id]: "approved" }))}>
                        <Check className="size-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setProviderDecisions((d) => ({ ...d, [p.id]: "rejected" }))}
                      >
                        <X className="size-4" />
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyQueue label="No providers awaiting review" />
            )}
          </TabsContent>

          <TabsContent value="venues" className="mt-4">
            {pendingVenues.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingVenues.map((v) => (
                  <Card key={v.id} className="flex flex-col overflow-hidden p-0">
                    <div className="aspect-[16/9] bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.images[0] || "/placeholder.svg"} alt={v.name} className="size-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {v.sports.map((s) => (
                          <SportBadge key={s} sport={s} />
                        ))}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold leading-tight">{v.name}</h3>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5" />
                          {v.address}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          by {v.providerName} · ${v.pricePerHour}/hr
                        </span>
                      </div>
                      <div className="mt-auto flex gap-2 border-t border-border pt-3">
                        <Button size="sm" className="flex-1" onClick={() => setVenueDecisions((d) => ({ ...d, [v.id]: "approved" }))}>
                          <Check className="size-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => setVenueDecisions((d) => ({ ...d, [v.id]: "rejected" }))}
                        >
                          <X className="size-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyQueue label="No venues awaiting review" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  )
}

function EmptyQueue({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CircleCheck className="size-6" />
      </div>
      <p className="font-semibold">Queue cleared</p>
      <p className="text-sm text-muted-foreground">{label}.</p>
    </div>
  )
}
