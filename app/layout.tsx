import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Navigation from '@/components/layout/Navigation'
import { Chatbot } from '@/components/Chatbot'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'NeuroCare AI - Cognitive Health Screening',
  description: 'AI-powered cognitive health screening for early detection of cognitive decline',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/web_logo.png',
      },
    ],
    apple: '/web_logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2C5AA0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-sans antialiased">
        <Navigation />
        {children}
        <Chatbot />
        <Analytics />
      </body>
    </html>
  )
}
