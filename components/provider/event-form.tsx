"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Repeat,
  Volleyball,
  Goal,
  Check,
  Loader2,
  AlertCircle,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar } from "@/components/ui/avatar"
import { TrainerFormModal } from "@/components/provider/trainer-form-modal"
import { SKILL_LEVELS, SPECIALIZATIONS } from "@/lib/mock-data"
import { adaptVenue } from "@/lib/adapters"
import type { EventType, Sport, Venue, SportEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DbTrainer {
  id: string
  name: string
  experience: string | null
  photo: string | null
}

export function EventForm({ event }: { event?: SportEvent }) {
  const router = useRouter()
  const isEdit = Boolean(event)

  const [venues, setVenues] = useState<Venue[]>([])
  const [loadingVenues, setLoadingVenues] = useState(true)

  const [trainers, setTrainers] = useState<DbTrainer[]>([])
  const [loadingTrainers, setLoadingTrainers] = useState(true)

  const [trainerModalOpen, setTrainerModalOpen] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<DbTrainer | null>(null)

  const [type, setType] = useState<EventType>(event?.type ?? "training")
  const [sport, setSport] = useState<Sport>(event?.sport ?? "volleyball")
  const [title, setTitle] = useState(event?.title ?? "")
  const [description, setDescription] = useState(event?.description ?? "")
  const [level, setLevel] = useState(event?.level ?? "")
  const [specs, setSpecs] = useState<string[]>(event?.specializations ?? [])
  const [venueId, setVenueId] = useState(event?.venueId ?? "")
  const [date, setDate] = useState(event?.date ?? "")
  const [startTime, setStartTime] = useState(event?.startTime ?? "18:00")
  const [endTime, setEndTime] = useState(event?.endTime ?? "19:30")
  const [trainerId, setTrainerId] = useState(event?.trainer.id ?? "")
  const [capacity, setCapacity] = useState(String(event?.capacity ?? 12))
  const [price, setPrice] = useState(String(event?.price ?? 15))
  const [regDeadline, setRegDeadline] = useState(String(event?.registrationDeadlineHours ?? 3))
  const [cancelDeadline, setCancelDeadline] = useState(String(event?.cancellationDeadlineHours ?? 12))
  const [recurring, setRecurring] = useState(event?.recurring ?? false)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Загрузка площадок
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/venues/my")
        const data = await res.json()
        if (!cancelled && data.venues) {
          const adapted = data.venues.map(adaptVenue)
          setVenues(adapted)
          if (!isEdit && adapted.length > 0 && !venueId) {
            setVenueId(adapted[0].id)
          }
        }
      } catch (err) {
        console.error("Load my venues error:", err)
      } finally {
        if (!cancelled) setLoadingVenues(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isEdit, venueId])

  // Загрузка тренеров
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/trainers")
        const data = await res.json()
        if (!cancelled && data.trainers) {
          setTrainers(data.trainers)
        }
      } catch (err) {
        console.error("Load trainers error:", err)
      } finally {
        if (!cancelled) setLoadingTrainers(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isEdit) return
    setSpecs([])
    const levels = SKILL_LEVELS[sport]
    if (levels.length > 0) {
      setLevel(levels[0].code)
    }
  }, [sport, isEdit])

  const toggleSpec = (s: string) =>
    setSpecs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const handleTrainerSaved = (newTrainer: DbTrainer) => {
    setTrainers((prev) => {
      const exists = prev.find((t) => t.id === newTrainer.id)
      if (exists) {
        return prev.map((t) => (t.id === newTrainer.id ? newTrainer : t))
      }
      return [newTrainer, ...prev]
    })
    setTrainerId(newTrainer.id)
    setTrainerModalOpen(false)
    setEditingTrainer(null)
  }

  const openCreateTrainer = () => {
    setEditingTrainer(null)
    setTrainerModalOpen(true)
  }

  const openEditTrainer = (t: DbTrainer) => {
    setEditingTrainer(t)
    setTrainerModalOpen(true)
  }

  const save = async () => {
    setError(null)

    if (!venueId) return setError("Выберите площадку")
    if (!title.trim()) return setError("Введите название события")
    if (!date) return setError("Укажите дату")
    if (specs.length === 0 && type === "training") {
      return setError("Выберите хотя бы одну специализацию для тренировки")
    }
    if (!trainerId) return setError("Выберите тренера или создайте нового")

    setSaving(true)

    try {
      const url = isEdit ? `/api/events/${event!.id}` : "/api/events"
      const method = isEdit ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId,
          trainerId,
          type,
          sport,
          title,
          description,
          level,
          specializations: specs,
          date,
          startTime,
          endTime,
          price: Number(price),
          capacity: Number(capacity),
          registrationDeadlineHours: Number(regDeadline),
          cancellationDeadlineHours: Number(cancelDeadline),
          recurring,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Что-то пошло не так")
        setSaving(false)
        return
      }

      router.push("/provider/events")
      router.refresh()
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return
    if (!confirm("Удалить событие? Это действие нельзя отменить.")) return

    setError(null)
    setDeleting(true)

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Не удалось удалить")
        setDeleting(false)
        return
      }

      router.push("/provider/events")
      router.refresh()
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
      setDeleting(false)
    }
  }

  if (loadingVenues || loadingTrainers) {
    return (
      <ProviderShell>
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </Card>
      </ProviderShell>
    )
  }

  if (venues.length === 0 && !isEdit) {
    return (
      <ProviderShell>
        <div className="flex flex-col gap-6">
          <Link
            href="/provider/events"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to sessions
          </Link>

          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertCircle className="size-8" />
            </span>
            <div>
              <p className="text-lg font-semibold">Сначала создайте площадку</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Событие (тренировка или игра) создаётся на одной из ваших площадок.
                У вас пока нет ни одной площадки.
              </p>
            </div>
            <ButtonLink href="/provider/venues/new">Создать площадку</ButtonLink>
          </Card>
        </div>
      </ProviderShell>
    )
  }

  const selectedTrainer = trainers.find((t) => t.id === trainerId)

  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <Link
          href="/provider/events"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sessions
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit session" : "Create a session"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? "Update the details of your session."
                : "Set up a training session or organized game for players to join."}
            </p>
          </div>

          {isEdit && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </>
              )}
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="flex flex-col gap-4 p-5">
              <h2 className="font-semibold">Session details</h2>

              <div>
                <Label className="mb-2 block">Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["training", "game"] as EventType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      disabled={saving}
                      className={cn(
                        "rounded-xl border-2 p-3 text-left transition-colors",
                        type === t
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className="block font-semibold capitalize">{t}</span>
                      <span className="text-xs text-muted-foreground">
                        {t === "training" ? "Coached skill session" : "Organized match play"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Evening Volleyball Fundamentals"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What will players do in this session?"
                  disabled={saving}
                />
              </div>

              <div>
                <Label className="mb-2 block">Sport</Label>
                <div className="grid grid-cols-2 gap-3">
                  {([["volleyball", Volleyball], ["football", Goal]] as const).map(
                    ([s, Icon]) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSport(s)}
                        disabled={saving || isEdit}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-colors",
                          sport === s
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                          isEdit && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg",
                            sport === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span className="font-medium capitalize">{s}</span>
                      </button>
                    )
                  )}
                </div>
                {isEdit && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Вид спорта нельзя изменить после создания события.
                  </p>
                )}
              </div>

              {type === "training" && (
                <div>
                  <Label className="mb-2 block">Focus areas</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS[sport].map((s) => {
                      const active = specs.includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpec(s)}
                          disabled={saving}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          {active && <Check className="size-3.5" />}
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>

            <Card className="flex flex-col gap-4 p-5">
              <h2 className="font-semibold">Schedule & venue</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="venue">Venue</Label>
                  <Select
                    id="venue"
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    disabled={saving}
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="start">Start time</Label>
                  <Input
                    id="start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="end">End time</Label>
                  <Input
                    id="end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <Repeat className="size-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Repeat weekly</span>
                    <span className="text-xs text-muted-foreground">
                      Create a recurring series
                    </span>
                  </div>
                </div>
                <Switch
                  checked={recurring}
                  onCheckedChange={setRecurring}
                  disabled={saving}
                />
              </div>
            </Card>

            <Card className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Trainer</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openCreateTrainer}
                  disabled={saving}
                >
                  <Plus className="size-3.5" />
                  Add trainer
                </Button>
              </div>

              {trainers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Пока нет сохранённых тренеров.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={openCreateTrainer}
                    disabled={saving}
                  >
                    <Plus className="size-3.5" />
                    Создать первого тренера
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="trainer">Select trainer</Label>
                    <Select
                      id="trainer"
                      value={trainerId}
                      onChange={(e) => setTrainerId(e.target.value)}
                      disabled={saving}
                    >
                      <option value="">— выберите тренера —</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {selectedTrainer && (
                    <div className="flex items-start gap-4 rounded-xl border border-border p-4">
                      <Avatar
                        src={selectedTrainer.photo ?? undefined}
                        name={selectedTrainer.name}
                        className="size-14"
                      />
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium truncate">{selectedTrainer.name}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditTrainer(selectedTrainer)}
                            disabled={saving}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                        </div>
                        {selectedTrainer.experience && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {selectedTrainer.experience}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20 flex flex-col gap-4 p-5">
              <h2 className="font-semibold">Capacity & pricing</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="capacity">Max players</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="level">Level</Label>
                <Select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={saving}
                >
                  {SKILL_LEVELS[sport].map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="regDeadline">Reg. closes (h)</Label>
                  <Input
                    id="regDeadline"
                    type="number"
                    value={regDeadline}
                    onChange={(e) => setRegDeadline(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cancelDeadline">Cancel (h)</Label>
                  <Input
                    id="cancelDeadline"
                    type="number"
                    value={cancelDeadline}
                    onChange={(e) => setCancelDeadline(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              <Button
                size="lg"
                className="h-11 w-full"
                onClick={save}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {isEdit ? "Saving…" : "Publishing…"}
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Publish session"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <TrainerFormModal
        open={trainerModalOpen}
        onOpenChange={setTrainerModalOpen}
        trainer={editingTrainer}
        onSuccess={handleTrainerSaved}
      />
    </ProviderShell>
  )
}