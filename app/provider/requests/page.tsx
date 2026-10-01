"use client"

import { useState } from "react"
import { Inbox, Check, X, MapPin, Clock, MessageSquare, CircleCheck, CircleX } from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BOOKING_REQUESTS, formatDate } from "@/lib/mock-data"
import type { BookingRequest } from "@/lib/types"

type Decision = "pending" | "approved" | "rejected"

export default function RequestsPage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  const decide = (id: string, d: Decision) => setDecisions((prev) => ({ ...prev, [id]: d }))

  const pending = BOOKING_REQUESTS.filter((r) => (decisions[r.id] ?? "pending") === "pending")
  const resolved = BOOKING_REQUESTS.filter((r) => (decisions[r.id] ?? "pending") !== "pending")

  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Booking requests</h1>
          <p className="text-muted-foreground">Approve or decline requests to book your venues.</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Pending</h2>
            <Badge variant="warning">{pending.length}</Badge>
          </div>
          {pending.length > 0 ? (
            pending.map((r) => <RequestCard key={r.id} request={r} onDecide={decide} />)
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-6 text-muted-foreground" />
              </div>
              <p className="font-semibold">You&apos;re all caught up</p>
              <p className="text-sm text-muted-foreground">No pending requests right now.</p>
            </div>
          )}
        </div>

        {resolved.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold">Resolved</h2>
            {resolved.map((r) => (
              <Card key={r.id} className="flex items-center gap-3 p-4">
                <Avatar name={r.playerName} className="size-9" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{r.playerName}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.venueName} · {formatDate(r.date)} · {r.time}
                  </span>
                </div>
                <div className="ml-auto">
                  {decisions[r.id] === "approved" ? (
                    <Badge variant="success">
                      <CircleCheck className="size-3.5" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge variant="danger">
                      <CircleX className="size-3.5" />
                      Declined
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProviderShell>
  )
}

function RequestCard({
  request,
  onDecide,
}: {
  request: BookingRequest
  onDecide: (id: string, d: Decision) => void
}) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Avatar name={request.playerName} className="size-11" />
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="font-semibold">{request.playerName}</span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {request.venueName}
          </span>
        </div>
        <span className="text-lg font-bold">${request.price}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-4" />
          {formatDate(request.date)} · {request.time}
        </span>
      </div>

      {request.comment && (
        <div className="flex gap-2 rounded-xl bg-muted/50 p-3 text-sm">
          <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">{request.comment}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => onDecide(request.id, "approved")}>
          <Check className="size-4" />
          Approve
        </Button>
        <Button
          variant="outline"
          className="flex-1 text-destructive hover:text-destructive"
          onClick={() => onDecide(request.id, "rejected")}
        >
          <X className="size-4" />
          Decline
        </Button>
      </div>
    </Card>
  )
}
