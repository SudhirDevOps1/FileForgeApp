"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface ToolLayoutProps {
  title: string
  description: string
  icon: LucideIcon
  children: ReactNode
}

export function ToolLayout({
  title,
  description,
  icon: Icon,
  children,
}: ToolLayoutProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 sm:mb-8">
        <div className="mb-2 flex items-center gap-2.5 sm:mb-3 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 sm:h-10 sm:w-10">
            <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
      </div>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  )
}
