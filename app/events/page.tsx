"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, SlidersHorizontal, Search, Loader2 } from "lucide-react"
import { PlayerShell } from "@/components/shells/player-shell"
import { EventCard } from "@/components/event/event-card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSportFilter } from "@/components/sport-context"
import { SKILL_LEVELS } from "@/lib/mock-data"
import { adaptEvent } from "@/lib/adapters"
import type { SportEvent, EventType } from "@/lib/types"

type TypeFilter = EventType | "all"

export default function EventsPage() {
  const { sport } = useSportFilter()
  const [events, setEvents] = useState<SportEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [type, setType] = useState<TypeFilter>("all")
  const [level, setLevel] = useState("all")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/events")
        const data = await res.json()
        if (!cancelled && data.events) {
          setEvents(data.events.map(adaptEvent))
        }
      } catch (err) {
        console.error("Load events error:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setLevel("all")
  }, [sport])

  const levelOptions = useMemo(() => {
    if (sport === "all") return []
    return SKILL_LEVELS[sport]
  }, [sport])

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false
      if (sport !== "all" && e.sport !== sport) return false
      if (type !== "all" && e.type !== type) return false
      if (level !== "all" && e.level !== level) return false
      return true
    })
  }, [events, query, sport, type, level])

  const reset = () => {
    setQuery("")
    setType("all")
    setLevel("all")
  }

  return (
    <PlayerShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Training & games</h1>
          <p className="text-muted-foreground">
            Join coached sessions and pick-up matches that fit your level.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions by name..."
            className="pl-9"
          />
        </div>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="size-4 text-primary" />
            Filters
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Type">
              <Select value={type} onChange={(e) => setType(e.target.value as TypeFilter)}>
                <option value="all">All types</option>
                <option value="training">Training</option>
                <option value="game">Game</option>
              </Select>
            </Field>
            <Field label="Level">
              <Select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={sport === "all"}
              >
                <option value="all">{sport === "all" ? "Pick a sport first" : "All levels"}</option>
                {levelOptions.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={reset}>
                Reset filters
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          </Card>
        ) : filtered.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> sessions found
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">No sessions match your filters</p>
              <p className="text-sm text-muted-foreground">Try widening your search.</p>
            </div>
            <Button variant="outline" onClick={reset}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </PlayerShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}