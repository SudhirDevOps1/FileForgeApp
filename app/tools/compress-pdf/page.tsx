"use client"

import { useState, useCallback } from "react"
import { Minimize2, Download } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory, formatFileSize } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function CompressPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{
    blob: Blob
    originalSize: number
    compressedSize: number
    name: string
  } | null>(null)

  const compress = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    setResult(null)
    try {
      const originalSize = files[0].size
      const arrayBuffer = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Basic compression: re-serialize the PDF
      // pdf-lib strips unused objects during serialization
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })

      const blob = new Blob([compressedBytes], { type: "application/pdf" })
      const outName = files[0].name.replace(/\.pdf$/i, "_compressed.pdf")

      setResult({
        blob,
        originalSize,
        compressedSize: blob.size,
        name: outName,
      })
    } finally {
      setProcessing(false)
    }
  }, [files])

  const download = useCallback(() => {
    if (!result) return
    saveAs(result.blob, result.name)
    addToDownloadHistory({
      fileName: result.name,
      tool: "Compress PDF",
      size: result.compressedSize,
    })
  }, [result])

  const reductionPercent = result
    ? Math.max(
        0,
        Math.round(
          ((result.originalSize - result.compressedSize) /
            result.originalSize) *
            100
        )
      )
    : 0

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size by re-serializing with optimized object streams."
      icon={Minimize2}
    >
      <Alert>
        <AlertDescription>
          Browser-based compression works by re-serializing the PDF and stripping
          unused objects. For heavy compression of image-rich PDFs, a server-side
          solution is recommended.
        </AlertDescription>
      </Alert>

      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={(f) => {
          setFiles(f)
          setResult(null)
        }}
        label="Drop a PDF file here"
      />

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0}
        onClick={compress}
        className="w-full"
      >
        <Minimize2 className="mr-2 h-4 w-4" />
        Compress PDF
      </ProcessingButton>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original</span>
              <span className="font-medium text-card-foreground">
                {formatFileSize(result.originalSize)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Compressed</span>
              <span className="font-medium text-primary">
                {formatFileSize(result.compressedSize)}
              </span>
            </div>
            <Progress value={100 - reductionPercent} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {reductionPercent > 0
                ? `Reduced by ${reductionPercent}%`
                : "File is already well-optimized"}
            </p>
            <Button onClick={download} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Compressed PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}
