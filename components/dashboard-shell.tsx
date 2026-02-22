"use client"

import { useState, useCallback, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Menu, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { tools } from "@/lib/tools"

function Breadcrumb() {
  const pathname = usePathname()

  if (pathname === "/") return null

  const segments: { label: string; href: string }[] = []

  if (pathname === "/history") {
    segments.push({ label: "History", href: "/history" })
  } else if (pathname.startsWith("/tools/")) {
    const slug = pathname.split("/tools/")[1]
    const tool = tools.find((t) => t.href === pathname)
    segments.push({ label: "Tools", href: "/" })
    segments.push({ label: tool?.name || slug, href: pathname })
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/"
        className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((seg, i) => (
        <span key={seg.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {i === segments.length - 1 ? (
            <span className="font-medium text-foreground">{seg.label}</span>
          ) : (
            <Link
              href={seg.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {seg.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const openSidebar = useCallback(() => setSidebarOpen(true), [])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-sm sm:h-16 sm:px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 lg:hidden"
            onClick={openSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Breadcrumb />

          <div className="flex-1" />

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 lg:p-8">
          {children}
        </main>

        <footer className="shrink-0 border-t border-border px-3 py-2.5 text-center text-xs text-muted-foreground sm:px-4 lg:px-6">
          Built by Sudhir Kumar |{" "}
          <a
            href="https://github.com/SudhirDevOps1"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-foreground"
          >
            @SudhirDevOps1
          </a>
        </footer>
      </div>
    </div>
  )
}
