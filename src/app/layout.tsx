import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import HeaderCartButton from '@/components/HeaderCartButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rayan Back | Grossiste Emballage Belgique',
  description: 'Commandez aujourd\'hui, livré demain. Grossiste en emballage alimentaire et accessoires pour professionnels en Belgique.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <CartProvider>
          <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            {/* Main Header */}
            <header className="site-header">
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>RAYAN BACK</span>
                <span style={{ fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                  Commandez aujourd'hui, livré demain en Belgique
                </span>
              </div>

              <HeaderCartButton />
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
        </CartProvider>
      </body>
    </html>
  )
}
