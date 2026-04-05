"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ---- Context ----

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  labelMap: React.MutableRefObject<Map<string, React.ReactNode>>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select compound components must be used within <Select>")
  return ctx
}

// ---- Select (root) ----

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const labelMap = React.useRef<Map<string, React.ReactNode>>(new Map())

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labelMap }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// ---- SelectTrigger ----

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

function SelectTrigger({ className, children }: SelectTriggerProps) {
  const { open, setOpen } = useSelectContext()

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      onClick={() => setOpen((prev) => !prev)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 ring-offset-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("ml-2 shrink-0 opacity-50 transition-transform", open && "rotate-180")}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

// ---- SelectValue ----

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value, labelMap } = useSelectContext()
  const display = value ? labelMap.current.get(value) : null

  if (!display && placeholder) {
    return <span className="text-zinc-400">{placeholder}</span>
  }
  return <span className="truncate">{display ?? value}</span>
}

// ---- SelectContent ----

interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

function SelectContent({ className, children }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  const ref = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.closest(".relative")?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-800 bg-zinc-900 py-1 text-sm shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
}

// ---- SelectItem ----

interface SelectItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

function SelectItem({ value: itemValue, className, children }: SelectItemProps) {
  const { value, onValueChange, setOpen, labelMap } = useSelectContext()
  const isSelected = value === itemValue

  // Register label for display in SelectValue
  React.useEffect(() => {
    labelMap.current.set(itemValue, children)
  })

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-zinc-50 outline-none hover:bg-zinc-800 focus:bg-zinc-800",
        isSelected && "bg-zinc-800/60",
        className
      )}
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
    >
      {children}
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute right-3 text-zinc-50"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
