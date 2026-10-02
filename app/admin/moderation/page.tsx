"use client"

import { useEffect, useState } from "react"
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
  Loader2,
} from "lucide-react"
import { AdminShell } from "@/components/shells/admin-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SportBadge } from "@/components/sport-badge"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Sport } from "@/lib/types"

interface PendingProvider {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  providerInfo: {
    organizationName: string | null
    description: string | null
    phone: string
    sportTypes: string[]
    moderationStatus: string
    createdAt: string
  } | null
  _count: { venues: number }
}

interface PendingVenue {
  id: string
  name: string
  address: string
  city: string
  sportTypes: string[]
  pricePerHour: unknown
  photos: string[]
  description: string | null
  createdAt: string
  provider: {
    name: string
    email: string
    phone: string | null
  }
}

export default function ModerationPage() {
  const [providers, setProviders] = useState<PendingProvider[]>([])
  const [venues, setVenues] = useState<PendingVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [rejectTarget, setRejectTarget] = useState<
    | { kind: "provider"; id: string; name: string }
    | { kind: "venue"; id: string; name: string }
    | null
  >(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [providersRes, venuesRes] = await Promise.all([
        fetch("/api/admin/moderation/providers"),
        fetch("/api/admin/moderation/venues"),
      ])

      const providersData = await providersRes.json()
      const venuesData = await venuesRes.json()

      if (providersData.providers) setProviders(providersData.providers)
      if (venuesData.venues) setVenues(venuesData.venues)

      if (providersData.error || venuesData.error) {
        setError(providersData.error || venuesData.error)
      }
    } catch {
      setError("Не удалось загрузить данные")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleApprove = async (kind: "provider" | "venue", id: string) => {
    setError(null)
    setProcessing(id)

    try {
      const endpoint =
        kind === "provider"
          ? `/api/admin/moderation/providers/${id}`
          : `/api/admin/moderation/venues/${id}`

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Не удалось одобрить")
        setProcessing(null)
        return
      }

      if (kind === "provider") {
        setProviders((prev) => prev.filter((p) => p.id !== id))
      } else {
        setVenues((prev) => prev.filter((v) => v.id !== id))
      }
    } catch {
      setError("Ошибка сети")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      setError("Укажите причину отклонения")
      return
    }

    setError(null)
    setProcessing(rejectTarget.id)

    try {
      const endpoint =
        rejectTarget.kind === "provider"
          ? `/api/admin/moderation/providers/${rejectTarget.id}`
          : `/api/admin/moderation/venues/${rejectTarget.id}`

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", reason: rejectReason.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Не удалось отклонить")
        setProcessing(null)
        return
      }

      if (rejectTarget.kind === "provider") {
        setProviders((prev) => prev.filter((p) => p.id !== rejectTarget.id))
      } else {
        setVenues((prev) => prev.filter((v) => v.id !== rejectTarget.id))
      }

      setRejectTarget(null)
      setRejectReason("")
    } catch {
      setError("Ошибка сети")
    } finally {
      setProcessing(null)
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Moderation queue</h1>
            <p className="text-muted-foreground">
              Review and approve new providers and venue listings.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Загрузка очереди…</p>
          </Card>
        ) : (
          <Tabs defaultValue="providers">
            <TabsList>
              <TabsTrigger value="providers">
                Providers ({providers.length})
              </TabsTrigger>
              <TabsTrigger value="venues">Venues ({venues.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="mt-4">
              {providers.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {providers.map((p) => {
                    const displayName = p.providerInfo?.organizationName || p.name
                    return (
                      <Card
                        key={p.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                      >
                        <Avatar name={displayName} className="size-12" />
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{displayName}</span>
                            <Badge variant="neutral">
                              <Building2 className="size-3" />
                              {p._count.venues} venues
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Mail className="size-3.5" />
                              {p.email}
                            </span>
                            {p.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="size-3.5" />
                                {p.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-3.5" />
                              {new Date(p.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {p.providerInfo?.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {p.providerInfo.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove("provider", p.id)}
                            disabled={processing === p.id}
                          >
                            {processing === p.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="size-4" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setRejectTarget({
                                kind: "provider",
                                id: p.id,
                                name: displayName,
                              })
                            }
                            disabled={processing === p.id}
                          >
                            <X className="size-4" />
                            Reject
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <EmptyQueue label="No providers awaiting review" />
              )}
            </TabsContent>

            <TabsContent value="venues" className="mt-4">
              {venues.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {venues.map((v) => (
                    <Card key={v.id} className="flex flex-col overflow-hidden p-0">
                      <div className="aspect-[16/9] bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.photos[0] || "/placeholder.svg"}
                          alt={v.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {v.sportTypes.map((s) => (
                            <SportBadge key={s} sport={s as Sport} />
                          ))}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="font-semibold leading-tight">{v.name}</h3>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" />
                            {v.address}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            by {v.provider.name} · ${Number(v.pricePerHour)}/hr
                          </span>
                        </div>
                        <div className="mt-auto flex gap-2 border-t border-border pt-3">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleApprove("venue", v.id)}
                            disabled={processing === v.id}
                          >
                            {processing === v.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="size-4" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() =>
                              setRejectTarget({
                                kind: "venue",
                                id: v.id,
                                name: v.name,
                              })
                            }
                            disabled={processing === v.id}
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
        )}
      </div>

      {/* Reject reason modal */}
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null)
            setRejectReason("")
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Отклонить «{rejectTarget?.name}»</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-5">
          <Label htmlFor="reject-reason">Причина отклонения</Label>
          <Textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Опишите причину — она будет видна пользователю"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setRejectTarget(null)
              setRejectReason("")
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={!rejectReason.trim() || Boolean(processing)}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Rejecting…
              </>
            ) : (
              "Reject"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
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