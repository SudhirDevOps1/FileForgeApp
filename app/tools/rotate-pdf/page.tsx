"use client"

import { useState, useCallback } from "react"
import { RotateCw, Download } from "lucide-react"
import { PDFDocument, degrees } from "pdf-lib"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type RotationMode = "all" | "individual"

interface PageRotation {
  index: number
  rotation: number
}

export default function RotatePdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [mode, setMode] = useState<RotationMode>("all")
  const [globalRotation, setGlobalRotation] = useState(90)
  const [pageCount, setPageCount] = useState(0)
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([])
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const loadPdf = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles)
    setDone(false)
    setPageRotations([])
    if (newFiles.length > 0) {
      const ab = await newFiles[0].arrayBuffer()
      const pdf = await PDFDocument.load(ab)
      const count = pdf.getPageCount()
      setPageCount(count)
      setPageRotations(
        Array.from({ length: count }, (_, i) => ({ index: i, rotation: 0 }))
      )
    } else {
      setPageCount(0)
    }
  }, [])

  const rotateAndDownload = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    setDone(false)
    try {
      const ab = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(ab)
      const pages = pdfDoc.getPages()

      for (let i = 0; i < pages.length; i++) {
        const currentRotation = pages[i].getRotation().angle
        const additionalRotation =
          mode === "all"
            ? globalRotation
            : pageRotations[i]?.rotation || 0
        if (additionalRotation !== 0) {
          pages[i].setRotation(degrees(currentRotation + additionalRotation))
        }
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: "application/pdf" })
      const outName = files[0].name.replace(/\.pdf$/i, "_rotated.pdf")
      saveAs(blob, outName)
      addToDownloadHistory({
        fileName: outName,
        tool: "Rotate PDF",
        size: blob.size,
      })
      setDone(true)
    } finally {
      setProcessing(false)
    }
  }, [files, mode, globalRotation, pageRotations])

  const setPageRotation = useCallback(
    (index: number, rotation: number) => {
      setPageRotations((prev) =>
        prev.map((p) => (p.index === index ? { ...p, rotation } : p))
      )
    },
    []
  )

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate pages in your PDF document. Rotate all pages at once or choose individual pages."
      icon={RotateCw}
    >
      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={loadPdf}
        label="Drop a PDF file here"
      />

      {pageCount > 0 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Rotation Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as RotationMode)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Rotate All Pages</SelectItem>
                  <SelectItem value="individual">Individual Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "all" ? (
              <div>
                <Label>Rotation Angle</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[90, 180, 270].map((angle) => (
                    <Button
                      key={angle}
                      variant={globalRotation === angle ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGlobalRotation(angle)}
                    >
                      {angle} degrees
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  All {pageCount} pages will be rotated {globalRotation} degrees clockwise
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-sm font-medium text-card-foreground">
                  Set rotation per page
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {pageRotations.map((page) => (
                    <div
                      key={page.index}
                      className="flex items-center justify-between rounded-lg border border-border p-2"
                    >
                      <span className="text-xs font-medium text-card-foreground">
                        Page {page.index + 1}
                      </span>
                      <Select
                        value={String(page.rotation)}
                        onValueChange={(v) =>
                          setPageRotation(page.index, Number(v))
                        }
                      >
                        <SelectTrigger className="h-7 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="90">90</SelectItem>
                          <SelectItem value="180">180</SelectItem>
                          <SelectItem value="270">270</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0}
        onClick={rotateAndDownload}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {done ? "Download Again" : "Rotate & Download"}
      </ProcessingButton>

      {done && (
        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          Rotation complete! Your PDF has been downloaded.
        </p>
      )}
    </ToolLayout>
  )
}
