import Link from "next/link"
import { Clock, MapPin, Users, Repeat } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SportBadge } from "@/components/sport-badge"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { formatDate, skillLabel } from "@/lib/mock-data"
import type { SportEvent } from "@/lib/types"

export function EventCard({ event }: { event: SportEvent }) {
  const spotsLeft = event.capacity - event.registered
  const fillPct = Math.round((event.registered / event.capacity) * 100)

  return (
    <Link href={`/events/${event.id}`} className="group">
      <Card className="flex h-full flex-col gap-4 p-5 transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <SportBadge sport={event.sport} />
            <Badge variant={event.type === "training" ? "accent" : "outline"}>
              {event.type === "training" ? "Training" : "Game"}
            </Badge>
            {event.recurring && (
              <Badge variant="outline">
                <Repeat className="size-3" />
                Weekly
              </Badge>
            )}
          </div>
          <span className="shrink-0 text-lg font-bold">${event.price}</span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-semibold leading-tight text-balance group-hover:text-primary">
            {event.title}
          </h3>
          <span className="inline-flex w-fit rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {skillLabel(event.sport, event.level)}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 shrink-0" />
            {formatDate(event.date)} · {event.startTime}–{event.endTime}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            {event.venueName}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-border pt-4">
          <Avatar src={event.trainer.photo} name={event.trainer.name} className="size-9" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">{event.trainer.name}</span>
            <span className="text-xs text-muted-foreground">{event.trainer.experience}</span>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Users className="size-3.5 text-muted-foreground" />
              {spotsLeft > 0 ? `${spotsLeft} left` : "Full"}
            </span>
            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className={fillPct >= 100 ? "h-full bg-destructive" : "h-full bg-primary"}
                style={{ width: `${Math.min(fillPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}