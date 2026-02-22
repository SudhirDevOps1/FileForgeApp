"use client"

import { useState, useEffect, useCallback } from "react"
import { History, Trash2, FileIcon } from "lucide-react"
import {
  getDownloadHistory,
  clearDownloadHistory,
  formatFileSize,
  type DownloadRecord,
} from "@/lib/download-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const [records, setRecords] = useState<DownloadRecord[]>([])

  useEffect(() => {
    setRecords(getDownloadHistory())
  }, [])

  const handleClear = useCallback(() => {
    clearDownloadHistory()
    setRecords([])
  }, [])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5 sm:mb-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 sm:h-10 sm:w-10">
              <History className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Download History
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            View your recent file conversions and downloads. Stored locally in
            your browser.
          </p>
        </div>
        {records.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear download history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all download records from your browser. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No downloads yet. Your conversion history will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <Card key={record.id}>
              <CardContent className="flex items-center gap-3 py-3 sm:gap-4 sm:py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                  <FileIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-card-foreground sm:text-sm">
                    {record.fileName}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {record.tool} &middot; {formatFileSize(record.size)}
                  </p>
                </div>
                <time className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {new Date(record.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
