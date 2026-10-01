"use client"

import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
  "aria-label"?: string
}

export function Switch({ checked, onCheckedChange, id, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        checked ? "bg-primary" : "bg-input",
        disabled && "cursor-not-allowed opacity-50",
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}
