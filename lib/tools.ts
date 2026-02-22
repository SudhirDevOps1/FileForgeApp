import {
  FileText,
  FileImage,
  Merge,
  Scissors,
  Minimize2,
  Droplets,
  FileOutput,
  ImageIcon,
  RotateCw,
  Lock,
  Hash,
  type LucideIcon,
} from "lucide-react"

export interface ToolDefinition {
  id: string
  name: string
  description: string
  icon: LucideIcon
  href: string
  category: "conversion" | "utility"
  tags: string[]
}

export const tools: ToolDefinition[] = [
  {
    id: "txt-to-pdf",
    name: "TXT to PDF",
    description: "Convert plain text files to PDF documents with pagination",
    icon: FileText,
    href: "/tools/txt-to-pdf",
    category: "conversion",
    tags: ["text", "convert", "document"],
  },
  {
    id: "pdf-to-txt",
    name: "PDF to Text",
    description: "Extract text content from PDF files",
    icon: FileOutput,
    href: "/tools/pdf-to-txt",
    category: "conversion",
    tags: ["extract", "text", "read"],
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert JPG, PNG, or WebP images to PDF",
    icon: FileImage,
    href: "/tools/image-to-pdf",
    category: "conversion",
    tags: ["image", "photo", "convert", "jpg", "png"],
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Extract individual pages from a PDF",
    icon: ImageIcon,
    href: "/tools/pdf-to-image",
    category: "conversion",
    tags: ["image", "extract", "page"],
  },
  {
    id: "merge-pdf",
    name: "Merge PDFs",
    description: "Combine multiple PDF files into one document",
    icon: Merge,
    href: "/tools/merge-pdf",
    category: "utility",
    tags: ["combine", "join", "merge"],
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Split a PDF into individual pages or ranges",
    icon: Scissors,
    href: "/tools/split-pdf",
    category: "utility",
    tags: ["split", "separate", "extract", "page"],
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while preserving quality",
    icon: Minimize2,
    href: "/tools/compress-pdf",
    category: "utility",
    tags: ["compress", "reduce", "shrink", "optimize"],
  },
  {
    id: "watermark-pdf",
    name: "Watermark PDF",
    description: "Add custom text watermarks to every page",
    icon: Droplets,
    href: "/tools/watermark-pdf",
    category: "utility",
    tags: ["watermark", "stamp", "brand"],
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate individual pages or entire PDF documents",
    icon: RotateCw,
    href: "/tools/rotate-pdf",
    category: "utility",
    tags: ["rotate", "orientation", "turn", "flip"],
  },
  {
    id: "protect-pdf",
    name: "Protect PDF",
    description: "Add password protection to your PDF files",
    icon: Lock,
    href: "/tools/protect-pdf",
    category: "utility",
    tags: ["password", "protect", "security", "encrypt", "lock"],
  },
  {
    id: "page-numbers",
    name: "Page Numbers",
    description: "Add page numbers to your PDF documents",
    icon: Hash,
    href: "/tools/page-numbers",
    category: "utility",
    tags: ["number", "page", "footer", "header"],
  },
]

export const conversionTools = tools.filter((t) => t.category === "conversion")
export const utilityTools = tools.filter((t) => t.category === "utility")
