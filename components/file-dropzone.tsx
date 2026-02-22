"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, X, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/download-history"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  files: File[]
  onFilesChange: (files: File[]) => void
  label?: string
}

export function FileDropzone({
  accept,
  multiple = false,
  maxSizeMB = 50,
  files,
  onFilesChange,
  label = "Drop files here or click to browse",
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming)
      const maxBytes = maxSizeMB * 1024 * 1024
      for (const file of arr) {
        if (file.size > maxBytes) {
          setError(`"${file.name}" exceeds ${maxSizeMB}MB limit`)
          return null
        }
      }
      setError(null)
      return arr
    },
    [maxSizeMB]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const valid = validateFiles(e.dataTransfer.files)
      if (valid) {
        onFilesChange(multiple ? [...files, ...valid] : valid.slice(0, 1))
      }
    },
    [files, multiple, onFilesChange, validateFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return
      const valid = validateFiles(e.target.files)
      if (valid) {
        onFilesChange(multiple ? [...files, ...valid] : valid.slice(0, 1))
      }
      e.target.value = ""
    },
    [files, multiple, onFilesChange, validateFiles]
  )

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index))
    },
    [files, onFilesChange]
  )

  return (
    <div className="space-y-2.5">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors sm:p-8",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <Upload
          className={cn(
            "mb-2 h-8 w-8 sm:mb-3 sm:h-10 sm:w-10",
            dragActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <p className="text-xs font-medium text-foreground sm:text-sm">{label}</p>
        <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
          Max {maxSizeMB}MB per file
          {accept && ` | ${accept}`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-label="File upload"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive sm:text-sm" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 sm:gap-3 sm:p-3"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-card-foreground sm:text-sm">
                  {file.name}
                </p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
                className="h-7 w-7 shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
