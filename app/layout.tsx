import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppLayout from "@/components/AppLayout"
import { Toaster } from "sonner"
import { QueryProvider } from "@/lib/query-client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vetnefits - Veterinary Management System",
  description: "Complete veterinary clinic management solution",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden`}>
        <QueryProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
