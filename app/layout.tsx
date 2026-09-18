import type { Metadata } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from "@/components/ui/sonner"

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TalentSleuth AI | Corporate Talent Intelligence',
  description: 'AI-powered talent analysis and candidate assessment platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} dark`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster theme="dark" />
        </AuthProvider>
      </body>
    </html>
  )
}
