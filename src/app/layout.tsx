import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DarkSphere - Share Your Thoughts',
  description: 'A modern social platform for sharing thoughts and connecting with others',
  keywords: ['social', 'platform', 'thoughts', 'community'],
  authors: [{ name: 'DarkSphere Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div id="root" className="min-h-screen bg-dark-bg">
          {children}
        </div>
      </body>
    </html>
  )
}