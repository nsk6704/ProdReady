"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"

export default function ShareButton({ reportId }: { reportId: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/report/${reportId}`

    if (navigator.share) {
      await navigator.share({
        title: "ProdReady Report",
        text: "Check out this production readiness report!",
        url,
      })
      return
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" onClick={handleShare} className="gap-2 relative overflow-hidden">
      <span className="relative flex items-center gap-2">
        {copied ? (
          <Check className="animate-pop-in h-4 w-4 text-green-500" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        <span className={copied ? "animate-fade-in-up" : ""}>
          {copied ? "Copied!" : "Share Report"}
        </span>
      </span>
      {copied && (
        <span className="absolute inset-0 rounded-md bg-green-50 dark:bg-green-950/20 animate-fade-in-up" />
      )}
    </Button>
  )
}
