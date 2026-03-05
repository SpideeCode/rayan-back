import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RAYAN-PACK',
  description: 'Catalogue de produits d\'emballage et accessoires',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
          {/* Main Header */}
          <header className="site-header">
            <div className="site-logo">
              <Image
                src="/logo.png"
                alt="RAYAN-BACK Logo"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                priority
              />
            </div>
          </header>

          <main style={{ flex: 1 }}>
            {children}
          </main>

          {/* Footer */}
          <footer style={{
            backgroundColor: '#111',
            color: '#888',
            padding: '24px',
            textAlign: 'center',
            fontSize: '14px',
            borderTop: '1px solid #333'
          }}>
            Développé par <a href="http://www.webora-da.be" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Webora</a>
          </footer>
        </div>
      </body>
    </html>
  )
}
