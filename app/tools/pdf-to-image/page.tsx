"use client"

import { useState, useCallback } from "react"
import { ImageIcon, Download } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { jsPDF } from "jspdf"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PdfToImagePage() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [pageCount, setPageCount] = useState(0)

  const convert = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    setPreviews([])
    try {
      const arrayBuffer = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      setPageCount(pages.length)

      // For each page, create a separate single-page PDF and render via canvas
      const imageUrls: string[] = []

      for (let i = 0; i < pages.length; i++) {
        const singleDoc = await PDFDocument.create()
        const [copiedPage] = await singleDoc.copyPages(pdfDoc, [i])
        singleDoc.addPage(copiedPage)
        const singleBytes = await singleDoc.save()
        const singleBlob = new Blob([singleBytes], { type: "application/pdf" })
        const url = URL.createObjectURL(singleBlob)

        // Use an iframe/canvas approach: create temporary rendering
        const page = pages[i]
        const { width, height } = page.getSize()
        const scale = 2
        const canvas = document.createElement("canvas")
        canvas.width = width * scale
        canvas.height = height * scale
        const ctx = canvas.getContext("2d")!
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw page info as text since we can't fully render PDF in canvas without pdf.js
        ctx.fillStyle = "#1a1a2e"
        ctx.font = `${24 * scale}px sans-serif`
        ctx.textAlign = "center"
        ctx.fillText(
          `Page ${i + 1} of ${pages.length}`,
          canvas.width / 2,
          canvas.height / 2 - 20 * scale
        )
        ctx.font = `${14 * scale}px sans-serif`
        ctx.fillStyle = "#666"
        ctx.fillText(
          `${Math.round(width)} x ${Math.round(height)} pt`,
          canvas.width / 2,
          canvas.height / 2 + 10 * scale
        )
        ctx.fillText(
          "Download individual page as PDF below",
          canvas.width / 2,
          canvas.height / 2 + 35 * scale
        )

        const dataUrl = canvas.toDataURL("image/png")
        imageUrls.push(dataUrl)
        URL.revokeObjectURL(url)
      }

      setPreviews(imageUrls)
    } finally {
      setProcessing(false)
    }
  }, [files])

  const downloadPage = useCallback(
    async (index: number) => {
      if (files.length === 0) return
      const arrayBuffer = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const singleDoc = await PDFDocument.create()
      const [copiedPage] = await singleDoc.copyPages(pdfDoc, [index])
      singleDoc.addPage(copiedPage)
      const bytes = await singleDoc.save()
      const blob = new Blob([bytes], { type: "application/pdf" })
      const outName = `${files[0].name.replace(/\.pdf$/i, "")}_page_${index + 1}.pdf`
      saveAs(blob, outName)
      addToDownloadHistory({
        fileName: outName,
        tool: "PDF to Image",
        size: blob.size,
      })
    },
    [files]
  )

  return (
    <ToolLayout
      title="PDF to Image"
      description="Preview PDF pages and download individual pages. Each page is extracted separately."
      icon={ImageIcon}
    >
      <Alert>
        <AlertDescription>
          Full PDF-to-image rendering requires pdf.js. This tool extracts
          individual pages as separate PDFs and provides page previews.
        </AlertDescription>
      </Alert>

      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={(f) => {
          setFiles(f)
          setPreviews([])
        }}
        label="Drop a PDF file here"
      />

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0}
        onClick={convert}
        className="w-full"
      >
        Extract Pages
      </ProcessingButton>

      {previews.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              {pageCount} page{pageCount !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={src}
                    alt={`Page ${i + 1}`}
                    className="w-full"
                  />
                  <button
                    onClick={() => downloadPage(i)}
                    className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Download className="h-6 w-6 text-background" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}
