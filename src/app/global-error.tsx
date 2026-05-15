"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 dark:bg-black">
        <div className="text-6xl">💥</div>
        <h1 className="text-2xl font-bold">Critical error</h1>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          {error.message || "The app crashed hard. Try refreshing."}
        </p>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
        >
          Reload
        </button>
      </body>
    </html>
  )
}
