import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'NSER Operator Portal',
  description: 'Real-time exclusion lookup for licensed gambling operators',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
