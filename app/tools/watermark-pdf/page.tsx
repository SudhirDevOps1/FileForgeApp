"use client"

import { useState, useCallback } from "react"
import { Droplets, Download } from "lucide-react"
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function WatermarkPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL")
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(0.15)
  const [color, setColor] = useState<"gray" | "red" | "blue">("gray")
  const [rotation, setRotation] = useState(45)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const apply = useCallback(async () => {
    if (files.length === 0 || !watermarkText.trim()) return
    setProcessing(true)
    setDone(false)
    try {
      const arrayBuffer = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const pages = pdfDoc.getPages()

      const colorMap = {
        gray: rgb(0.5, 0.5, 0.5),
        red: rgb(0.8, 0.1, 0.1),
        blue: rgb(0.1, 0.1, 0.8),
      }

      for (const page of pages) {
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)

        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: colorMap[color],
          opacity,
          rotate: degrees(rotation),
        })
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: "application/pdf" })
      const outName = files[0].name.replace(/\.pdf$/i, "_watermarked.pdf")
      saveAs(blob, outName)
      addToDownloadHistory({
        fileName: outName,
        tool: "Watermark PDF",
        size: blob.size,
      })
      setDone(true)
    } finally {
      setProcessing(false)
    }
  }, [files, watermarkText, fontSize, opacity, color, rotation])

  return (
    <ToolLayout
      title="Watermark PDF"
      description="Add a custom text watermark to every page of your PDF document."
      icon={Droplets}
    >
      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={(f) => {
          setFiles(f)
          setDone(false)
        }}
        label="Drop a PDF file here"
      />

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label htmlFor="watermark-text">Watermark Text</Label>
            <Input
              id="watermark-text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="mt-1.5"
              placeholder="Enter watermark text"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={12}
                max={120}
                step={2}
                className="mt-3"
              />
            </div>
            <div>
              <Label>Opacity: {Math.round(opacity * 100)}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={([v]) => setOpacity(v)}
                min={0.05}
                max={0.5}
                step={0.05}
                className="mt-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Color</Label>
              <Select
                value={color}
                onValueChange={(v) => setColor(v as "gray" | "red" | "blue")}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rotation: {rotation} degrees</Label>
              <Slider
                value={[rotation]}
                onValueChange={([v]) => setRotation(v)}
                min={-90}
                max={90}
                step={5}
                className="mt-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0 || !watermarkText.trim()}
        onClick={apply}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {done ? "Download Again" : "Apply Watermark & Download"}
      </ProcessingButton>

      {done && (
        <p className="text-center text-sm text-accent-foreground">
          Watermark applied! Your PDF has been downloaded.
        </p>
      )}
    </ToolLayout>
  )
}
