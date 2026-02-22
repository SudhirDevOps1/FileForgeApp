"use client"

import { useState, useCallback } from "react"
import { FileImage, Download } from "lucide-react"
import { jsPDF } from "jspdf"
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

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [fileName, setFileName] = useState("images")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  )
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const convert = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    try {
      const doc = new jsPDF({ orientation, unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10

      for (let i = 0; i < files.length; i++) {
        if (i > 0) doc.addPage()
        const img = await loadImage(files[i])

        const maxW = pageWidth - margin * 2
        const maxH = pageHeight - margin * 2
        const ratio = Math.min(maxW / img.width, maxH / img.height)
        const w = img.width * ratio
        const h = img.height * ratio
        const x = (pageWidth - w) / 2
        const y = (pageHeight - h) / 2

        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92)

        doc.addImage(dataUrl, "JPEG", x, y, w, h)
      }

      const blob = doc.output("blob")
      const outName = `${fileName}.pdf`
      saveAs(blob, outName)
      addToDownloadHistory({
        fileName: outName,
        tool: "Image to PDF",
        size: blob.size,
      })
      setDone(true)
    } finally {
      setProcessing(false)
    }
  }, [files, fileName, orientation])

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert JPG, PNG, or WebP images to a PDF document. Each image becomes a page."
      icon={FileImage}
    >
      <FileDropzone
        accept="image/jpeg,image/png,image/webp"
        multiple
        files={files}
        onFilesChange={(f) => {
          setFiles(f)
          setDone(false)
        }}
        label="Drop images here (JPG, PNG, WebP)"
      />

      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="img-file-name">Output File Name</Label>
                <Input
                  id="img-file-name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Orientation</Label>
                <Select
                  value={orientation}
                  onValueChange={(v) =>
                    setOrientation(v as "portrait" | "landscape")
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {files.length} image{files.length !== 1 ? "s" : ""} selected —
              each image will be placed on its own page.
            </p>
          </CardContent>
        </Card>
      )}

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0}
        onClick={convert}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {done ? "Download Again" : "Convert & Download PDF"}
      </ProcessingButton>

      {done && (
        <p className="text-center text-sm text-accent-foreground">
          Conversion complete! Your PDF has been downloaded.
        </p>
      )}
    </ToolLayout>
  )
}
