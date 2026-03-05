import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
          <header style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            padding: '24px 48px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>RAYAN-BACK</h1>
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
