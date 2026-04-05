import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

export function getAccountTypeColor(type: string): string {
  const colors: Record<string, string> = {
    CHECKING: "#2563eb",
    SAVINGS: "#16a34a",
    CREDIT_CARD: "#7c3aed",
    INVESTMENT: "#f59e0b",
    LOAN: "#ef4444",
    OTHER: "#6b7280",
  }
  return colors[type] || colors.OTHER
}

export function getAccountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CHECKING: "Checking",
    SAVINGS: "Savings",
    CREDIT_CARD: "Credit Card",
    INVESTMENT: "Investment",
    LOAN: "Loan",
    OTHER: "Other",
  }
  return labels[type] || type
}
