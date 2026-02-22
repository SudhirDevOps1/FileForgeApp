"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  tools,
  conversionTools,
  utilityTools,
  type ToolDefinition,
} from "@/lib/tools"
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Search,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"

function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={tool.href}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 sm:p-5"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20 sm:mb-4 sm:h-10 sm:w-10">
        <tool.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-card-foreground sm:text-base">
        {tool.name}
      </h3>
      <p className="flex-1 text-xs text-muted-foreground sm:text-sm">
        {tool.description}
      </p>
      <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:mt-4 sm:text-sm">
        Open tool <ArrowRight className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </div>
    </Link>
  )
}

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "All processing happens locally in your browser. Zero uploads, zero waiting.",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "Your files never leave your device. Complete privacy, always.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "No installs needed. Works on any device with a modern browser.",
  },
]

export default function HomePage() {
  const [search, setSearch] = useState("")

  const filteredTools = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    )
  }, [search])

  return (
    <div className="mx-auto max-w-5xl space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Hero */}
      <section>
        <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          File Utility Tools
        </h1>
        <p className="mt-1.5 max-w-2xl text-pretty text-sm text-muted-foreground sm:mt-2 sm:text-base lg:text-lg">
          Convert, merge, split, compress, and watermark your files -- all
          processed locally in your browser for maximum privacy and speed.
        </p>

        {/* Search */}
        <div className="relative mt-4 max-w-md sm:mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Search results */}
      {filteredTools !== null ? (
        <section>
          <p className="mb-3 text-sm text-muted-foreground">
            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
          </p>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center sm:p-12">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {"No tools match your search. Try different keywords."}
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Feature badges */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 sm:p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 sm:h-9 sm:w-9">
                  <feature.icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-card-foreground sm:text-sm">
                    {feature.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Conversion tools */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">
              Conversion Tools
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {conversionTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>

          {/* Utility tools */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground sm:mb-4 sm:text-lg">
              PDF Utilities
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {utilityTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="grid grid-cols-3 divide-x divide-border text-center">
              <div>
                <p className="text-xl font-bold text-primary sm:text-2xl lg:text-3xl">
                  {tools.length}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                  Free Tools
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary sm:text-2xl lg:text-3xl">
                  0
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                  Server Uploads
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-primary sm:text-2xl lg:text-3xl">
                  100%
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
                  Privacy
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
