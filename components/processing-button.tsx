"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface ProcessingButtonProps {
  processing: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

export function ProcessingButton({
  processing,
  disabled,
  onClick,
  children,
  className,
}: ProcessingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={processing || disabled}
      className={className}
      size="lg"
    >
      {processing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
