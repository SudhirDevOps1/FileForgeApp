"use client"

import { useState, useCallback } from "react"
import { FileOutput, Download, Copy, Check } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PdfToTxtPage() {
  const [files, setFiles] = useState<File[]>([])
  const [extractedText, setExtractedText] = useState("")
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pageCount, setPageCount] = useState(0)

  const extract = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    try {
      const arrayBuffer = await files[0].arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      setPageCount(pages.length)

      // pdf-lib doesn't have native text extraction; we use a basic approach
      // that reads text objects from the content streams
      const textParts: string[] = []

      // Using a workaround: read PDF as text and extract readable content
      const uint8 = new Uint8Array(arrayBuffer)
      const textDecoder = new TextDecoder("utf-8", { fatal: false })
      const rawText = textDecoder.decode(uint8)

      // Extract text between BT (begin text) and ET (end text) markers
      const btEtRegex = /BT\s([\s\S]*?)ET/g
      let match
      while ((match = btEtRegex.exec(rawText)) !== null) {
        const block = match[1]
        // Extract text from Tj and TJ operators
        const tjRegex = /\(([^)]*)\)\s*Tj/g
        let tjMatch
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          textParts.push(tjMatch[1])
        }
        // Also extract from TJ arrays
        const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g
        let arrMatch
        while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
          const inner = arrMatch[1]
          const stringRegex = /\(([^)]*)\)/g
          let strMatch
          while ((strMatch = stringRegex.exec(inner)) !== null) {
            textParts.push(strMatch[1])
          }
        }
      }

      const result =
        textParts.join(" ").trim() ||
        "No extractable text found. This PDF may contain scanned images or use unsupported encoding."
      setExtractedText(result)
    } catch {
      setExtractedText(
        "Error: Could not process this PDF. It may be corrupted or encrypted."
      )
    } finally {
      setProcessing(false)
    }
  }, [files])

  const downloadTxt = useCallback(() => {
    if (!extractedText) return
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" })
    const outName = files[0]?.name.replace(/\.pdf$/i, ".txt") || "extracted.txt"
    saveAs(blob, outName)
    addToDownloadHistory({
      fileName: outName,
      tool: "PDF to Text",
      size: blob.size,
    })
  }, [extractedText, files])

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(extractedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [extractedText])

  return (
    <ToolLayout
      title="PDF to Text"
      description="Extract text content from PDF files. Works best with text-based PDFs."
      icon={FileOutput}
    >
      <Alert>
        <AlertDescription>
          This tool extracts text from PDF content streams. Scanned/image-based
          PDFs require OCR which is not available in-browser.
        </AlertDescription>
      </Alert>

      <FileDropzone
        accept=".pdf"
        files={files}
        onFilesChange={(f) => {
          setFiles(f)
          setExtractedText("")
        }}
        label="Drop a PDF file here"
      />

      <ProcessingButton
        processing={processing}
        disabled={files.length === 0}
        onClick={extract}
        className="w-full"
      >
        Extract Text
      </ProcessingButton>

      {extractedText && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {pageCount > 0 && (
              <p className="text-sm text-muted-foreground">
                PDF contains {pageCount} page{pageCount !== 1 ? "s" : ""}
              </p>
            )}
            <Textarea
              value={extractedText}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                {copied ? (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button onClick={downloadTxt} variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download .txt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </ToolLayout>
  )
}
