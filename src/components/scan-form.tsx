"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowRight, GitBranch } from "lucide-react"

export default function ScanForm() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Scan failed")
        setLoading(false)
        return
      }

      router.push(`/report/${data.id}`)
    } catch {
      setError("Something went wrong. Try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex w-full gap-2">
        <div className="relative flex-1">
          <GitBranch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-lg opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100 bg-amber-400/30" />
            <Input
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="relative pl-9"
              disabled={loading}
            />
          </div>
        </div>
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Scan <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </form>
  )
}
