"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  Receipt,
  PieChart,
  Target,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MobileNav } from "@/components/layout/mobile-nav"

interface User {
  name?: string | null
  email?: string | null
}

interface AppShellProps {
  user: User
  children: React.ReactNode
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Import", href: "/import", icon: Upload },
  { label: "Pay Stubs", href: "/pay", icon: Receipt },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

function getInitials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function SidebarContent({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            FinPulse
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-200">
              {user.name || "User"}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {user.email}
            </p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

export function AppShell({ user, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-dvh bg-zinc-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-900 md:block">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-zinc-800 bg-zinc-900 px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-zinc-800 bg-zinc-900 p-0">
              <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="ml-3 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            FinPulse
          </span>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-zinc-950">
          <div className="mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </div>
  )
}
