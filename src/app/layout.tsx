import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prodready.sakethkashyap.dev"),
  title: "ProdReady: Is your side project production ready?",
  description:
    "Paste a GitHub repo and get a quick production readiness check for your side project. Practical pointers to ship with confidence.",
  openGraph: {
    title: "ProdReady: Is your side project production ready?",
    description:
      "Paste a GitHub repo and get a quick production readiness check for your side project.",
    siteName: "ProdReady",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
