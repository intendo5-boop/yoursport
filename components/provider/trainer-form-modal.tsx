"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, ImagePlus, X } from "lucide-react"
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"

interface DbTrainer {
  id: string
  name: string
  experience: string | null
  photo: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  trainer: DbTrainer | null  // null = создание нового
  onSuccess?: (trainer: DbTrainer) => void
}

export function TrainerFormModal({ open, onOpenChange, trainer, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = Boolean(trainer)

  const [name, setName] = useState("")
  const [experience, setExperience] = useState("")
  const [photo, setPhoto] = useState("")

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Сброс состояния при каждом открытии модалки
  useEffect(() => {
    if (open) {
      setName(trainer?.name ?? "")
      setExperience(trainer?.experience ?? "")
      setPhoto(trainer?.photo ?? "")
      setError(null)
    }
  }, [open, trainer])

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.value = ""
    fileInputRef.current?.click()
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const filename = `trainers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

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
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const save = async () => {
    setError(null)

    if (!name.trim()) {
      setError("Введите имя тренера")
      return
    }

    setSaving(true)

    try {
      const url = isEdit ? `/api/trainers/${trainer!.id}` : "/api/trainers"
      const method = isEdit ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          experience: experience.trim(),
          photo,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Что-то пошло не так")
        setSaving(false)
        return
      }

      if (onSuccess) onSuccess(data.trainer)
      onOpenChange(false)
    } catch {
      setError("Ошибка сети. Попробуйте снова.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit trainer" : "Add trainer"}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4 px-5">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Avatar src={photo || undefined} name={name || "Trainer"} className="size-16" />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Загрузка…
                </>
              ) : (
                <>
                  <ImagePlus className="size-4" />
                  {photo ? "Заменить фото" : "Загрузить фото"}
                </>
              )}
            </button>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto("")}
                disabled={saving}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
              >
                <X className="size-3" />
                Удалить фото
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trainer-modal-name">Trainer name</Label>
          <Input
            id="trainer-modal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marco Reyes"
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trainer-modal-exp">Experience</Label>
          <Textarea
            id="trainer-modal-exp"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={3}
            placeholder="e.g. 10 years coaching youth and adult volleyball"
            disabled={saving}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving || uploading}>
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving…
            </>
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Create trainer"
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}