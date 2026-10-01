"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
  disabled?: boolean
  "aria-label"?: string
}

export function Checkbox({
  checked,
  onCheckedChange,
  id,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  )
}
