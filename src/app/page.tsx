import ScanForm from "@/components/scan-form"
import ThemeToggle from "@/components/theme-toggle"
import { FiGithub } from "react-icons/fi"

const stagger = [0, 100, 200, 300, 450, 550]

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border/40 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-xl font-bold">ProdReady</span>
        </div>
        <ThemeToggle />
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

      <footer className="text-muted-foreground flex items-center justify-center gap-6 border-t px-6 py-4 text-sm">
        <span>Made for indie hackers who ship</span>
        <span className="text-muted-foreground/50">|</span>
        <a
          href="https://github.com/nsk6704/ProdReady"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <FiGithub className="h-4 w-4" />
          nsk6704/ProdReady
        </a>
        <span className="text-muted-foreground/50">|</span>
        <span>
          Made by{" "}
          <a
            href="https://sakethkashyap.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-500 hover:text-amber-400 transition-colors"
          >
            Saketh
          </a>
        </span>
      </footer>
    </div>
  )
}
