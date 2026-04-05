"use client"

import * as React from "react"
import { create } from "zustand"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

function toast(props: Omit<Toast, "id">) {
  useToastStore.getState().addToast(props)
}

function useToast() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.removeToast)
  return { toasts, toast, dismiss }
}

function ToastProvider() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, t.duration ?? 5000)
    return () => clearTimeout(timer)
  }, [t.duration, onDismiss])

  return (
    <div
      className={cn(
        "pointer-events-auto w-80 rounded-lg border p-4 shadow-lg transition-all",
        t.variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50"
          : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {t.title && (
            <p className="text-sm font-semibold">{t.title}</p>
          )}
          {t.description && (
            <p className="mt-1 text-sm opacity-90">{t.description}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="ml-2 shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
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
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export { toast, useToast, ToastProvider }
