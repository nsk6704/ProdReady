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
            A production readiness check for side projects
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Is Your Repo{" "}
            <span className="text-amber-500">ProdReady</span>?
          </h1>

          <p className="text-muted-foreground mb-6 max-w-lg text-lg leading-relaxed">
            Paste any public GitHub repo and get a quick health check for your
            side project. Practical pointers to ship with confidence.
          </p>

          <ScanForm />

          <div className="text-muted-foreground mt-6 max-w-md text-xs leading-relaxed">
            We check 14 common things like README, CI/CD, error handling,
            tests, and security basics. Not a full audit — just a sanity check
            before you hit deploy.
          </div>

          <div className="text-muted-foreground/60 mt-3 max-w-md text-xs leading-relaxed">
            Reports are stored for 24 hours so you can share the link. No code
            is ever stored — only metadata from the scan.
          </div>
        </div>
      </main>

      <footer className="text-muted-foreground flex items-center justify-center border-t px-6 py-4 text-sm">
        Made for indie hackers who ship.
      </footer>
    </div>
  )
}
