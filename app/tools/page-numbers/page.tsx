"use client"

import { useState, useCallback } from "react"
import { Hash, Download } from "lucide-react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

type Position = "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right"

export default function PageNumbersPage() {
  const [files, setFiles] = useState<File[]>([])
  const [position, setPosition] = useState<Position>("bottom-center")
  const [startNumber, setStartNumber] = useState(1)
  const [fontSize, setFontSize] = useState(12)
  const [format, setFormat] = useState<"plain" | "dash" | "of">("plain")
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [pageCount, setPageCount] = useState(0)

  const loadPdf = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles)
    setDone(false)
    if (newFiles.length > 0) {
      const ab = await newFiles[0].arrayBuffer()
      const pdf = await PDFDocument.load(ab)
      setPageCount(pdf.getPageCount())
    } else {
      setPageCount(0)
    }
  }, [])

  const addPageNumbers = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    setDone(false)
    try {
      const ab = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(ab)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const total = pages.length

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const num = i + startNumber

        let text = ""
        switch (format) {
          case "plain":
            text = String(num)
            break
          case "dash":
            text = `- ${num} -`
            break
          case "of":
            text = `${num} of ${total + startNumber - 1}`
            break
        }

        const textWidth = font.widthOfTextAtSize(text, fontSize)
        const margin = 36

        let x = 0
        let y = 0

        switch (position) {
          case "bottom-center":
            x = (width - textWidth) / 2
            y = margin
            break
          case "bottom-left":
            x = margin
            y = margin
            break
          case "bottom-right":
            x = width - textWidth - margin
            y = margin
            break
          case "top-center":
            x = (width - textWidth) / 2
            y = height - margin
            break
          case "top-left":
            x = margin
            y = height - margin
            break
          case "top-right":
            x = width - textWidth - margin
            y = height - margin
            break
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        })
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: "application/pdf" })
      const outName = files[0].name.replace(/\.pdf$/i, "_numbered.pdf")
      saveAs(blob, outName)
      addToDownloadHistory({
        fileName: outName,
        tool: "Page Numbers",
        size: blob.size,
      })
      setDone(true)
    } finally {
      setProcessing(false)
    }
  }, [files, position, startNumber, fontSize, format])

  return (
    <ToolLayout
      title="Page Numbers"
      description="Add page numbers to your PDF document. Customize position, format, and starting number."
      icon={Hash}
    >
      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={loadPdf}
        label="Drop a PDF file here"
      />

      {pageCount > 0 && (
        <p className="text-xs text-muted-foreground sm:text-sm">
          {pageCount} page{pageCount !== 1 ? "s" : ""} detected
        </p>
      )}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Position</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as "plain" | "dash" | "of")}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">1, 2, 3...</SelectItem>
                  <SelectItem value="dash">- 1 -, - 2 -...</SelectItem>
                  <SelectItem value="of">1 of N, 2 of N...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="start-num">Starting Number</Label>
              <Input
                id="start-num"
                type="number"
                min={1}
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value)))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Font Size: {fontSize}pt</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={8}
                max={24}
                step={1}
                className="mt-3"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Preview
            </p>
            <div className="relative mx-auto h-24 w-16 rounded border border-border bg-card shadow-sm sm:h-32 sm:w-24">
              <span
                className={`absolute text-[8px] text-muted-foreground sm:text-[10px] ${
                  position.startsWith("top") ? "top-1" : "bottom-1"
                } ${
                  position.endsWith("center")
                    ? "left-1/2 -translate-x-1/2"
                    : position.endsWith("left")
                      ? "left-1"
                      : "right-1"
                }`}
              >
                {format === "plain"
                  ? startNumber
                  : format === "dash"
                    ? `- ${startNumber} -`
                    : `${startNumber} of ${pageCount + startNumber - 1}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0}
        onClick={addPageNumbers}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {done ? "Download Again" : "Add Numbers & Download"}
      </ProcessingButton>

      {done && (
        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          Page numbers added! Your PDF has been downloaded.
        </p>
      )}
    </ToolLayout>
  )
}
