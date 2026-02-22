"use client"

import { useState, useCallback } from "react"
import { Scissors, Download } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export default function SplitPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [customRange, setCustomRange] = useState("")
  const [splitPages, setSplitPages] = useState<
    { index: number; blob: Blob; name: string }[]
  >([])

  const loadPdf = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles)
    setSplitPages([])
    setSelectedPages(new Set())
    if (newFiles.length > 0) {
      const ab = await newFiles[0].arrayBuffer()
      const pdf = await PDFDocument.load(ab)
      const count = pdf.getPageCount()
      setPageCount(count)
      const all = new Set<number>()
      for (let i = 0; i < count; i++) all.add(i)
      setSelectedPages(all)
    } else {
      setPageCount(0)
    }
  }, [])

  const togglePage = useCallback(
    (index: number) => {
      const next = new Set(selectedPages)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      setSelectedPages(next)
    },
    [selectedPages]
  )

  const applyRange = useCallback(() => {
    if (!customRange.trim()) return
    const indices = new Set<number>()
    const parts = customRange.split(",")
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(pageCount, end); i++) {
            indices.add(i - 1)
          }
        }
      } else {
        const num = Number(trimmed)
        if (!isNaN(num) && num >= 1 && num <= pageCount) {
          indices.add(num - 1)
        }
      }
    }
    setSelectedPages(indices)
  }, [customRange, pageCount])

  const split = useCallback(async () => {
    if (files.length === 0 || selectedPages.size === 0) return
    setProcessing(true)
    try {
      const ab = await files[0].arrayBuffer()
      const sourcePdf = await PDFDocument.load(ab)
      const baseName = files[0].name.replace(/\.pdf$/i, "")
      const results: { index: number; blob: Blob; name: string }[] = []

      const sorted = Array.from(selectedPages).sort((a, b) => a - b)

      for (const pageIndex of sorted) {
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex])
        newPdf.addPage(copiedPage)
        const bytes = await newPdf.save()
        const blob = new Blob([bytes], { type: "application/pdf" })
        results.push({
          index: pageIndex,
          blob,
          name: `${baseName}_page_${pageIndex + 1}.pdf`,
        })
      }

      setSplitPages(results)
    } finally {
      setProcessing(false)
    }
  }, [files, selectedPages])

  const downloadPage = useCallback(
    (page: { blob: Blob; name: string }) => {
      saveAs(page.blob, page.name)
      addToDownloadHistory({
        fileName: page.name,
        tool: "Split PDF",
        size: page.blob.size,
      })
    },
    []
  )

  const downloadAll = useCallback(() => {
    for (const page of splitPages) {
      saveAs(page.blob, page.name)
      addToDownloadHistory({
        fileName: page.name,
        tool: "Split PDF",
        size: page.blob.size,
      })
    }
  }, [splitPages])

  return (
    <ToolLayout
      title="Split PDF"
      description="Split a PDF into individual pages. Select which pages to extract."
      icon={Scissors}
    >
      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={loadPdf}
        label="Drop a PDF file here"
      />

      {pageCount > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="custom-range">
                Page Range (e.g. 1-3, 5, 7-10)
              </Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id="custom-range"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder={`1-${pageCount}`}
                />
                <Button onClick={applyRange} variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-card-foreground">
                Pages ({selectedPages.size} of {pageCount} selected)
              </p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {Array.from({ length: pageCount }, (_, i) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-border p-1.5 text-[11px] transition-colors hover:bg-muted sm:gap-1.5 sm:p-2 sm:text-xs"
                  >
                    <Checkbox
                      checked={selectedPages.has(i)}
                      onCheckedChange={() => togglePage(i)}
                    />
                    {i + 1}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0 || selectedPages.size === 0}
        onClick={split}
        className="w-full"
      >
        <Scissors className="mr-2 h-4 w-4" />
        Split {selectedPages.size} Page{selectedPages.size !== 1 ? "s" : ""}
      </ProcessingButton>

      {splitPages.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-card-foreground">
                Extracted Pages
              </p>
              <Button onClick={downloadAll} variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download All
              </Button>
            </div>
            <ul className="space-y-2">
              {splitPages.map((page) => (
                <li
                  key={page.index}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span className="text-sm text-card-foreground">
                    {page.name}
                  </span>
                  <Button
                    onClick={() => downloadPage(page)}
                    variant="ghost"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}
