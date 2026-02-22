export interface DownloadRecord {
  id: string
  fileName: string
  tool: string
  timestamp: number
  size: number
}

const STORAGE_KEY = "fileforge-download-history"

export function getDownloadHistory(): DownloadRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addToDownloadHistory(record: Omit<DownloadRecord, "id" | "timestamp">) {
  const history = getDownloadHistory()
  const newRecord: DownloadRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  history.unshift(newRecord)
  const trimmed = history.slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  return newRecord
}

export function clearDownloadHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}
