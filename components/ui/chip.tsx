"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SelectableChip({
  selected,
  onToggle,
  children,
  className,
}: {
  selected: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  )
}

export function FilterChip({
  onRemove,
  children,
}: {
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1.5 text-xs font-medium text-primary">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove filter"
        className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}
