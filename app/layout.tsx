import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cognitive Tests',
  description: 'Cognitive skill assessment tests',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen flex items-center justify-center font-sans">
        {children}
      </body>
    </html>
  )
}
