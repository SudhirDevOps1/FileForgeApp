"use client"

import { useState, useCallback } from "react"
import { FileText, Download } from "lucide-react"
import { jsPDF } from "jspdf"
import { saveAs } from "file-saver"
import { ToolLayout } from "@/components/tool-layout"
import { FileDropzone } from "@/components/file-dropzone"
import { ProcessingButton } from "@/components/processing-button"
import { addToDownloadHistory } from "@/lib/download-history"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function TxtToPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [textContent, setTextContent] = useState("")
  const [fileName, setFileName] = useState("output")
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const loadFileContent = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles)
    setDone(false)
    if (newFiles.length > 0) {
      const text = await newFiles[0].text()
      setTextContent(text)
      setFileName(newFiles[0].name.replace(/\.[^/.]+$/, ""))
    }
  }, [])

  const convert = useCallback(async () => {
    if (!textContent.trim()) return
    setProcessing(true)
    try {
      const doc = new jsPDF()
      const lines = doc.splitTextToSize(textContent, 180)
      let y = 20
      const pageHeight = doc.internal.pageSize.getHeight()

      for (const line of lines) {
        if (y > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
        doc.text(line, 15, y)
        y += 7
      }

      const blob = doc.output("blob")
      const outName = `${fileName}.pdf`
      saveAs(blob, outName)
      addToDownloadHistory({
        fileName: outName,
        tool: "TXT to PDF",
        size: blob.size,
      })
      setDone(true)
    } finally {
      setProcessing(false)
    }
  }, [textContent, fileName])

  return (
    <ToolLayout
      title="TXT to PDF"
      description="Convert plain text files to PDF documents. Upload a .txt file or paste text directly."
      icon={FileText}
    >
      <FileDropzone
        accept=".txt,.text,.md"
        files={files}
        onFilesChange={loadFileContent}
        label="Drop a text file here or click to browse"
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value)
                setDone(false)
              }}
              placeholder="Paste or type your text here..."
              className="mt-1.5 min-h-[200px] font-mono text-sm"
            />
          </div>
          <div>
            <Label htmlFor="file-name">Output File Name</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <ProcessingButton
        processing={processing}
        disabled={!textContent.trim()}
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
