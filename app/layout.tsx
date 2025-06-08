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
    generator: 'v0.dev'
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
