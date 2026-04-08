import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '청약모아 - 청약정보 한눈에',
  description: 'SH, LH, GH 청약정보를 한눈에 확인하세요',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
