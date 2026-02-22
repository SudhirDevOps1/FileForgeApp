"use client"

import { useState, useCallback } from "react"
import { Merge, Download, GripVertical } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [fileName, setFileName] = useState("merged")
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const merge = useCallback(async () => {
    if (files.length < 2) return
    setProcessing(true)
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        )
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes], { type: "application/pdf" })
      const outName = `${fileName}.pdf`
      saveAs(blob, outName)
      addToDownloadHistory({
        fileName: outName,
        tool: "Merge PDFs",
        size: blob.size,
      })
      setDone(true)
    } finally {
      setProcessing(false)
    }
  }, [files, fileName])

  const moveFile = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= files.length) return
      const updated = [...files]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      setFiles(updated)
    },
    [files]
  )

  return (
    <ToolLayout
      title="Merge PDFs"
      description="Combine multiple PDF files into a single document. Drag to reorder before merging."
      icon={Merge}
    >
      <FileDropzone
        accept=".pdf"
        multiple
        files={files}
        onFilesChange={(f) => {
          setFiles(f)
          setDone(false)
        }}
        label="Drop PDF files here (minimum 2)"
      />

      {files.length > 1 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-medium text-card-foreground">
              Merge Order
            </p>
            <ul className="space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-card-foreground">
                    {file.name}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveFile(i, i - 1)}
                      disabled={i === 0}
                      className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                      aria-label="Move up"
                    >
                      &uarr;
                    </button>
                    <button
                      onClick={() => moveFile(i, i + 1)}
                      disabled={i === files.length - 1}
                      className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                      aria-label="Move down"
                    >
                      &darr;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <Label htmlFor="merge-file-name">Output File Name</Label>
              <Input
                id="merge-file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <ProcessingButton
        processing={processing}
        disabled={files.length < 2}
        onClick={merge}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {done ? "Download Again" : `Merge ${files.length} PDFs`}
      </ProcessingButton>

      {done && (
        <p className="text-center text-sm text-accent-foreground">
          Merge complete! Your combined PDF has been downloaded.
        </p>
      )}
    </ToolLayout>
  )
}
