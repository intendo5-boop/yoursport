"use client"

import { LayoutGrid, Volleyball, Goal } from "lucide-react"
import { useSportFilter, type SportFilter } from "@/components/sport-context"
import { cn } from "@/lib/utils"

const SPORT_OPTIONS: {
  value: SportFilter
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "volleyball", label: "Volley", icon: Volleyball },
  { value: "football", label: "Football", icon: Goal },
]

export function SportRail() {
  const { sport, setSport } = useSportFilter()

  return (
    <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center gap-1.5 border-r border-border bg-card pt-5 md:flex">
      <span className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground">
        Sport
      </span>
      {SPORT_OPTIONS.map((option) => {
        const Icon = option.icon
        const active = sport === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setSport(option.value)}
            aria-pressed={active}
            title={option.label}
            className={cn(
              "flex w-14 flex-col items-center gap-1 rounded-xl py-3 text-[0.625rem] font-semibold uppercase leading-tight tracking-wide transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-6" />
            {option.label}
          </button>
        )
      })}
    </aside>
  )
}

export function SportRailMobile() {
  const { sport, setSport } = useSportFilter()

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Sport
      </span>
      {SPORT_OPTIONS.map((option) => {
        const Icon = option.icon
        const active = sport === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setSport(option.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {option.label === "Volley" ? "Volleyball" : option.label}
          </button>
        )
      })}
    </div>
  )
}
