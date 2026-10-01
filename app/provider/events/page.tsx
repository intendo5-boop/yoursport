"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Users, Clock, MapPin, Repeat, Loader2, CalendarDays, Pencil } from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { SportBadge } from "@/components/sport-badge"
import { adaptEvent } from "@/lib/adapters"
import { formatDate, skillLabel } from "@/lib/mock-data"
import type { SportEvent } from "@/lib/types"

export default function ProviderEventsPage() {
  const [events, setEvents] = useState<SportEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/events/my")
        const data = await res.json()
        if (!cancelled && data.events) {
          setEvents(data.events.map(adaptEvent))
        }
      } catch (err) {
        console.error("Load my events error:", err)
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
            <h1 className="text-2xl font-bold tracking-tight">My sessions</h1>
            <p className="text-muted-foreground">
              Track registrations and manage your training and games.
            </p>
          </div>
          <ButtonLink href="/provider/events/new">
            <Plus className="size-4" />
            Create session
          </ButtonLink>
        </div>

        {loading ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          </Card>
        ) : events.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CalendarDays className="size-8" />
            </span>
            <div>
              <p className="text-lg font-semibold">Нет созданных событий</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Создайте тренировку или игру, чтобы игроки могли записаться.
              </p>
            </div>
            <ButtonLink href="/provider/events/new">
              <Plus className="size-4" />
              Создать первое событие
            </ButtonLink>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((e) => {
              const fillPct =
                e.capacity > 0 ? Math.round((e.registered / e.capacity) * 100) : 0
              const nearFull = fillPct >= 80
              return (
                <Card key={e.id} className="p-0 overflow-hidden">
                  <Link
                    href={`/provider/events/${e.id}`}
                    className="block p-5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <SportBadge sport={e.sport} />
                          <Badge variant={e.type === "training" ? "accent" : "outline"}>
                            {e.type === "training" ? "Training" : "Game"}
                          </Badge>
                          {e.recurring && (
                            <Badge variant="outline">
                              <Repeat className="size-3" />
                              Weekly
                            </Badge>
                          )}
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {skillLabel(e.sport, e.level)}
                          </span>
                        </div>
                        <h3 className="font-semibold leading-tight">{e.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {formatDate(e.date)} · {e.startTime}–{e.endTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {e.venueName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 lg:w-72 lg:justify-end">
                        <div className="flex flex-1 flex-col gap-1 lg:max-w-40">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="size-3.5" />
                              {e.registered}/{e.capacity}
                            </span>
                            <span
                              className={
                                nearFull
                                  ? "font-medium text-primary"
                                  : "text-muted-foreground"
                              }
                            >
                              {fillPct}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(fillPct, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                          <Pencil className="size-3.5" />
                          Manage
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </ProviderShell>
  )
}