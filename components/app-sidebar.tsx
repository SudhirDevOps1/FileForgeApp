"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  FileText,
  FileImage,
  Merge,
  Scissors,
  Minimize2,
  Droplets,
  FileOutput,
  ImageIcon,
  History,
  Github,
  X,
  RotateCw,
  Lock,
  Hash,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "History", href: "/history", icon: History },
    ],
  },
  {
    label: "Conversion",
    items: [
      { name: "TXT to PDF", href: "/tools/txt-to-pdf", icon: FileText },
      { name: "PDF to Text", href: "/tools/pdf-to-txt", icon: FileOutput },
      { name: "Image to PDF", href: "/tools/image-to-pdf", icon: FileImage },
      { name: "PDF to Image", href: "/tools/pdf-to-image", icon: ImageIcon },
    ],
  },
  {
    label: "Utilities",
    items: [
      { name: "Merge PDFs", href: "/tools/merge-pdf", icon: Merge },
      { name: "Split PDF", href: "/tools/split-pdf", icon: Scissors },
      { name: "Compress PDF", href: "/tools/compress-pdf", icon: Minimize2 },
      { name: "Watermark PDF", href: "/tools/watermark-pdf", icon: Droplets },
      { name: "Rotate PDF", href: "/tools/rotate-pdf", icon: RotateCw },
      { name: "Protect PDF", href: "/tools/protect-pdf", icon: Lock },
      { name: "Page Numbers", href: "/tools/page-numbers", icon: Hash },
    ],
  },
]

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLElement>(null)

  // Focus trap for mobile
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-[280px] flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-out will-change-transform sm:w-64 lg:static lg:w-60 lg:translate-x-0 xl:w-64",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4 sm:h-16 sm:px-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">
              FileForge
            </span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center justify-between">
            <a
              href="https://github.com/SudhirDevOps1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              SudhirDevOps1
            </a>
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
