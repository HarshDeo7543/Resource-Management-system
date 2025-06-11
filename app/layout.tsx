import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"
import { getUserRole, getUserName } from "@/app/actions/auth"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ResourcePortal - Resource Management System",
  description: "A comprehensive resource management portal for IT assets and user management",
  generator: "Harsh Deo",
  
  icons: {
    // primary favicon .ico
    icon: "/favicon.ico",
    // PNG fallbacks at various sizes
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
  },

  manifest: "/site.webmanifest",          // your web app manifest
  // msapplicationConfig: "/browserconfig.xml", // IE/Edge config
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userRole = await getUserRole()
  const userName = await getUserName()

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Navigation userRole={userRole} userName={userName} />
          <main className="flex-1 overflow-auto">{children}</main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
