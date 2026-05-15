"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check, Copy } from "lucide-react"

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
    <Button variant="outline" onClick={handleShare} className="gap-2">
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {copied ? "Copied!" : "Share Report"}
    </Button>
  )
}
