"use client"

import { useEffect, useState } from "react"
import { Plus, Users, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { ProviderShell } from "@/components/shells/provider-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Avatar } from "@/components/ui/avatar"
import { TrainerFormModal } from "@/components/provider/trainer-form-modal"
import type { Trainer } from "@/lib/types"

interface DbTrainer {
  id: string
  name: string
  experience: string | null
  photo: string | null
}

export default function ProviderTrainersPage() {
  const [trainers, setTrainers] = useState<DbTrainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DbTrainer | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadTrainers() {
    setLoading(true)
    try {
      const res = await fetch("/api/trainers")
      const data = await res.json()
      if (data.trainers) {
        setTrainers(data.trainers)
      }
    } catch (err) {
      console.error("Load trainers error:", err)
      setError("Не удалось загрузить тренеров")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrainers()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (trainer: DbTrainer) => {
    setEditing(trainer)
    setModalOpen(true)
  }

  const handleDelete = async (trainer: DbTrainer) => {
    if (!confirm(`Удалить тренера «${trainer.name}»?`)) return

    setError(null)
    setDeletingId(trainer.id)

    try {
      const res = await fetch(`/api/trainers/${trainer.id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Не удалось удалить тренера")
        setDeletingId(null)
        return
      }

      setTrainers((prev) => prev.filter((t) => t.id !== trainer.id))
    } catch {
      setError("Ошибка сети")
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveSuccess = (trainer: DbTrainer) => {
    setTrainers((prev) => {
      const exists = prev.find((t) => t.id === trainer.id)
      if (exists) {
        return prev.map((t) => (t.id === trainer.id ? trainer : t))
      }
      return [trainer, ...prev]
    })
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <ProviderShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">My trainers</h1>
            <p className="text-muted-foreground">
              Manage trainers who run your training sessions. They can be reused across events.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add trainer
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading trainers...</p>
          </Card>
        ) : trainers.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="size-8" />
            </span>
            <div>
              <p className="text-lg font-semibold">Пока нет тренеров</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                Добавьте первого тренера — потом сможете выбирать его при создании тренировок.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Добавить тренера
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trainers.map((t) => (
              <Card key={t.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start gap-4">
                  <Avatar src={t.photo ?? undefined} name={t.name} className="size-14" />
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <h3 className="font-semibold truncate">{t.name}</h3>
                    {t.experience && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {t.experience}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(t)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(t)}
                    disabled={deletingId === t.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === t.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TrainerFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        trainer={editing}
        onSuccess={handleSaveSuccess}
      />
    </ProviderShell>
  )
}