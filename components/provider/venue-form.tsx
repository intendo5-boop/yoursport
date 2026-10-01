"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImagePlus, Check, Volleyball, Goal, Loader2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CITIES, SPORT_LABELS } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import type { Sport, Venue } from "@/lib/types"
import { cn } from "@/lib/utils"

const AMENITIES = [
  "Changing rooms",
  "Showers",
  "Parking",
  "Equipment rental",
  "Cafe",
  "Lighting",
  "Spectator seating",
  "Lockers",
]

const SPORT_ICONS = { volleyball: Volleyball, football: Goal }

export function VenueForm({ venue }: { venue?: Venue }) {
  const router = useRouter()
  const isEdit = Boolean(venue)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(venue?.name ?? "")
  const [description, setDescription] = useState(venue?.description ?? "")
  const [sports, setSports] = useState<Sport[]>(venue?.sports ?? [])
  const [city, setCity] = useState(venue?.city ?? CITIES[0]?.name ?? "")
  const [metro, setMetro] = useState(venue?.metro ?? "")
  const [address, setAddress] = useState(venue?.address ?? "")
  const [surface, setSurface] = useState(venue?.surface ?? "")
  const [pricePerHour, setPricePerHour] = useState(String(venue?.pricePerHour ?? 30))
  const [publicBooking, setPublicBooking] = useState(venue?.publicBooking ?? true)
  const [amenities, setAmenities] = useState<string[]>(venue?.amenities ?? [])
  const [photos, setPhotos] = useState<string[]>(venue?.images ?? [])
  const [cancellationDeadlineHours, setCancellationDeadlineHours] = useState(
    String(venue?.cancellationDeadlineHours ?? 12)
  )

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    try {
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Только изображения разрешены")
          setUploading(false)
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Файл больше 5 МБ")
          setUploading(false)
          return
        }

        const ext = file.name.split(".").pop() ?? "jpg"
        const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("venues")
          .upload(filename, file, {
            contentType: file.type,
            upsert: false,
          })

        if (uploadError) {
          setError("Ошибка загрузки: " + uploadError.message)
          setUploading(false)
          return
        }

        const { data: urlData } = supabase.storage
          .from("venues")
          .getPublicUrl(filename)

        newUrls.push(urlData.publicUrl)
      }

      setPhotos((prev) => [...prev, ...newUrls])
    } catch (err: any) {
      console.error("Upload error:", err)
      setError("Ошибка сети при загрузке фото")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    setError(null)

    if (!name.trim()) return setError("Введите название площадки")
    if (!address.trim()) return setError("Введите адрес")
    if (!city) return setError("Выберите город")
    if (sports.length === 0) return setError("Выберите хотя бы один вид спорта")
    if (!pricePerHour || Number(pricePerHour) <= 0) return setError("Введите цену больше 0")
    if (!cancellationDeadlineHours || Number(cancellationDeadlineHours) < 0) {
      return setError("Дедлайн отмены должен быть неотрицательным числом")
    }

    setSaving(true)

    try {
      const url = isEdit ? `/api/venues/${venue!.id}` : "/api/venues"
      const method = isEdit ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          sports,
          city,
          metro,
          address,
          surface,
          pricePerHour: Number(pricePerHour),
          publicBooking,
          amenities,
          photos,
          cancellationDeadlineHours: Number(cancellationDeadlineHours),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Что-то пошло не так")
        setSaving(false)
        return
      }

      router.push("/provider/venues")
      router.refresh()
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/provider/venues"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to venues
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit venue" : "Add a venue"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? "Update your listing details. Changes go live after a quick review."
            : "List a new court or pitch. New venues are reviewed before appearing publicly."}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="flex flex-col gap-4 p-5">
            <h2 className="font-semibold">Basics</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Venue name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Downtown Sports Hall"
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
                placeholder="Describe the facility, surface, and what makes it great..."
                disabled={saving}
              />
            </div>
            <div>
              <Label className="mb-2 block">Sports offered</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(SPORT_LABELS) as Sport[]).map((s) => {
                  const Icon = SPORT_ICONS[s]
                  const active = sports.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(sports, s, setSports)}
                      disabled={saving}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-colors",
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="font-medium">{SPORT_LABELS[s]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <h2 className="font-semibold">Location</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={saving}
                >
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="metro">Nearest metro</Label>
                <Input
                  id="metro"
                  value={metro}
                  onChange={(e) => setMetro(e.target.value)}
                  placeholder="e.g. Union Square"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Street address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
                disabled={saving}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <h2 className="font-semibold">Photos</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl border border-border group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Venue photo ${i + 1}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    disabled={saving}
                    className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    title="Удалить фото"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving || uploading}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                    <span className="text-xs font-medium">Загрузка…</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-6" />
                    <span className="text-xs font-medium">Upload</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Можно загрузить несколько фото. Максимум 5 МБ на файл.
            </p>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <h2 className="font-semibold">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const active = amenities.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggle(amenities, a, setAmenities)}
                    disabled={saving}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {active && <Check className="size-3.5" />}
                    {a}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 flex flex-col gap-4 p-5">
            <h2 className="font-semibold">Pricing & booking</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price per hour ($)</Label>
              <Input
                id="price"
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="surface">Surface</Label>
              <Input
                id="surface"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="e.g. Hardwood, Grass"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cancelDeadline">Дедлайн отмены (часов)</Label>
              <Input
                id="cancelDeadline"
                type="number"
                min={0}
                value={cancellationDeadlineHours}
                onChange={(e) => setCancellationDeadlineHours(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                За сколько часов до начала игрок может отменить бронь.
                Провайдер может отменить бронь в любой момент без ограничений.
              </p>
            </div>
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Allow public booking</span>
                <span className="text-xs text-muted-foreground">
                  Players can book instantly without approval.
                </span>
              </div>
              <Switch
                checked={publicBooking}
                onCheckedChange={setPublicBooking}
                disabled={saving}
              />
            </div>
            <Button
              size="lg"
              className="h-11 w-full"
              onClick={save}
              disabled={saving || uploading}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Submit for review"
              )}
            </Button>
            {!isEdit && (
              <p className="text-center text-xs text-muted-foreground">
                New venues are typically reviewed within 24 hours.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}