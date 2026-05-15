import ScanForm from "@/components/scan-form"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border/40 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-xl font-bold">ProdReady</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="bg-amber-50 text-amber-700 mb-6 rounded-full px-4 py-1.5 text-sm font-medium">
            Roast your side project before production does
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Is Your Repo{" "}
            <span className="text-amber-500">ProdReady</span>?
          </h1>

          <p className="text-muted-foreground mb-10 max-w-lg text-lg leading-relaxed">
            Paste any public GitHub repo and get a production readiness score.
            Opinionated findings, actionable fixes, and zero corporate jargon.
          </p>

          <ScanForm />
        </div>
      </main>

      <footer className="text-muted-foreground flex items-center justify-center border-t px-6 py-4 text-sm">
        Made for indie hackers who ship.
      </footer>
    </div>
  )
}
