import ScanForm from "@/components/scan-form"
import ThemeToggle from "@/components/theme-toggle"
import { FaGithub } from "react-icons/fa"

const stagger = [0, 100, 200, 300, 450, 550]

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border/40 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-xl font-bold">ProdReady</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/nsk6704/ProdReady"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-accent/30 px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-500"
          >
            <FaGithub className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div
            className="animate-fade-in-up bg-amber-50 text-amber-700 mb-6 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ animationDelay: `${stagger[0]}ms` }}
          >
            A production readiness check for side projects
          </div>

          <h1
            className="animate-fade-in-up mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ animationDelay: `${stagger[1]}ms` }}
          >
            Is Your Repo{" "}
            <span className="text-amber-500">ProdReady</span>?
          </h1>

          <p
            className="animate-fade-in-up text-muted-foreground mb-6 max-w-lg text-lg leading-relaxed"
            style={{ animationDelay: `${stagger[2]}ms` }}
          >
            Paste any public GitHub repo and get a quick health check for your
            side project. Practical pointers to ship with confidence.
          </p>

          <div style={{ animationDelay: `${stagger[3]}ms` }} className="animate-fade-in-up w-full max-w-lg">
            <ScanForm />
          </div>

          <div
            className="animate-fade-in-up text-muted-foreground mt-6 max-w-md text-xs leading-relaxed"
            style={{ animationDelay: `${stagger[4]}ms` }}
          >
            We check 14 common things like README, CI/CD, error handling,
            tests, and security basics. This isn&apos;t a full audit, just a sanity
            check before you hit deploy.
          </div>

          <div
            className="animate-fade-in-up text-muted-foreground/60 mt-3 max-w-md text-xs leading-relaxed"
            style={{ animationDelay: `${stagger[5]}ms` }}
          >
            Reports are stored for 24 hours so you can share the link. We
            don&apos;t store any code, only metadata from the scan.
          </div>
        </div>
      </main>

      <footer className="text-muted-foreground border-t px-4 py-4 text-center text-xs sm:flex sm:items-center sm:justify-center sm:gap-2 sm:px-6 sm:text-sm">
        Made for indie hackers who ship
        <span className="mx-1.5 hidden text-muted-foreground/30 sm:inline">·</span>
        <span className="block sm:inline">
          Made by{" "}
          <a
            href="https://sakethkashyap.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-500 transition-colors hover:text-amber-400"
          >
            Saketh
          </a>
        </span>
      </footer>
    </div>
  )
}
