"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Info, Volleyball, Goal, Check, Loader2 } from "lucide-react"
import { PlayerShell } from "@/components/shells/player-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Tooltip } from "@/components/ui/tooltip"
import { CITIES, SKILL_LEVELS, SPORT_LABELS } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import type { Sport } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [city, setCity] = useState(CITIES[0]?.name ?? "")
  const [sports, setSports] = useState<Sport[]>(["volleyball"])
  const [levels, setLevels] = useState<Record<Sport, string>>({
    volleyball: "B2",
    football: "D2",
  })

  // Загрузка текущего профиля
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [sessionRes, levelsRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/me/levels"),
        ])

        const sessionData = await sessionRes.json()
        const levelsData = await levelsRes.json()

        if (cancelled) return

        if (sessionData.session) {
          setName(sessionData.session.name ?? "")
          setCity(sessionData.session.city ?? CITIES[0]?.name ?? "")
          // photoUrl пока не в сессии — оставляем пустым
        }

        if (levelsData.levels && levelsData.levels.length > 0) {
          const loadedSports: Sport[] = []
          const loadedLevels: Record<Sport, string> = {
            volleyball: "B2",
            football: "D2",
          }
          for (const l of levelsData.levels) {
            if (l.sportType === "volleyball" || l.sportType === "football") {
              loadedSports.push(l.sportType)
              loadedLevels[l.sportType] = l.level
            }
          }
          if (loadedSports.length > 0) {
            setSports(loadedSports)
            setLevels(loadedLevels)
          }
        }
      } catch (err) {
        console.error("Load profile error:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleSport = (s: Sport) => {
    setSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const openPhoto = () => {
    if (fileRef.current) fileRef.current.value = ""
    fileRef.current?.click()
  }

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    try {
      const file = files[0]
      if (!file.type.startsWith("image/")) {
        setError("Только изображения разрешены")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Файл больше 5 МБ")
        return
      }

      const ext = file.name.split(".").pop() ?? "jpg"
      const filename = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("venues")
        .upload(filename, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        setError("Ошибка загрузки: " + uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from("venues")
        .getPublicUrl(filename)

      setPhoto(urlData.publicUrl)
    } catch {
      setError("Ошибка сети при загрузке фото")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!city.trim()) {
      setError("Выберите город")
      return
    }
    if (sports.length === 0) {
      setError("Выберите хотя бы один вид спорта")
      return
    }

    setSaving(true)

    try {
      // 1. Сохранить город и фото в профиль
      const profileRes = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, photoUrl: photo, name }),
      })

      if (!profileRes.ok) {
        const data = await profileRes.json()
        setError(data.error || "Не удалось сохранить профиль")
        setSaving(false)
        return
      }

      // 2. Сохранить уровни
      const levelsPayload = sports.map((s) => ({
        sportType: s,
        level: levels[s],
      }))

      const levelsRes = await fetch("/api/me/levels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levels: levelsPayload }),
      })

      if (!levelsRes.ok) {
        const data = await levelsRes.json()
        setError(data.error || "Не удалось сохранить уровни")
        setSaving(false)
        return
      }

      router.push("/events")
      router.refresh()
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
      setSaving(false)
    }
  }

  const sportMeta: { value: Sport; icon: typeof Volleyball }[] = [
    { value: "volleyball", icon: Volleyball },
    { value: "football", icon: Goal },
  ]

  if (loading) {
    return (
      <PlayerShell>
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </Card>
      </PlayerShell>
    )
  }

  return (
    <PlayerShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us how you play so we can match you with the right venues and sessions.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Card className="flex items-center gap-5 p-5">
            <button
              type="button"
              onClick={openPhoto}
              disabled={uploading}
              className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
              aria-label="Upload profile photo"
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Profile preview" className="size-full object-cover" />
              ) : (
                <Camera className="size-6" />
              )}
            </button>
            <div>
              <p className="font-semibold">Profile photo</p>
              <p className="text-sm text-muted-foreground">JPG or PNG, up to 5MB.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={openPhoto}
                disabled={uploading}
              >
                {uploading ? "Загрузка…" : "Upload photo"}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={saving}
              >
                {CITIES.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Which sports do you play?</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {sportMeta.map((s) => {
                const Icon = s.icon
                const selected = sports.includes(s.value)
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSport(s.value)}
                    disabled={saving}
                    aria-pressed={selected}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                      selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg",
                        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="font-semibold">{SPORT_LABELS[s.value]}</span>
                    <span
                      className={cn(
                        "ml-auto flex size-5 items-center justify-center rounded-md border-2 transition-colors",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {selected && <Check className="size-3" strokeWidth={3} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {sports.length > 0 && (
            <div className="flex flex-col gap-4">
              <Label>Your skill level</Label>
              {sports.map((sport) => {
                const level = SKILL_LEVELS[sport].find((l) => l.code === levels[sport])
                return (
                  <div key={sport} className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {SPORT_LABELS[sport]}
                      {level && (
                        <Tooltip content={level.description}>
                          <Info className="size-3.5 cursor-help" />
                        </Tooltip>
                      )}
                    </span>
                    <Select
                      value={levels[sport]}
                      onChange={(e) =>
                        setLevels((prev) => ({ ...prev, [sport]: e.target.value }))
                      }
                      disabled={saving}
                    >
                      {SKILL_LEVELS[sport].map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.code} · {l.label}
                        </option>
                      ))}
                    </Select>
                    {level && (
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              size="lg"
              className="h-11 px-6 text-base"
              disabled={saving || uploading}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Сохранение…
                </>
              ) : (
                "Save & explore venues"
              )}
            </Button>
          </div>
        </form>
      </div>
    </PlayerShell>
  )
}