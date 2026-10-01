"use client"

import { cn } from "@/lib/utils"

interface PriceRangeProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  className?: string
}

export function PriceRange({ min, max, value, onChange, step = 1, className }: PriceRangeProps) {
  const [low, high] = value
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label="Minimum price"
          onChange={(e) => onChange([Math.min(Number(e.target.value), high - step), high])}
          className="range-thumb pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label="Maximum price"
          onChange={(e) => onChange([low, Math.max(Number(e.target.value), low + step)])}
          className="range-thumb pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>${low}</span>
        <span>${high}+</span>
      </div>
    </div>
  )
}
