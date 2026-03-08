import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import HeaderCartButton from '@/components/HeaderCartButton'
import { Phone, Mail, Clock, Package } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rayan Back | Grossiste Emballage Belgique',
  description: 'Commandez aujourd\'hui, livré demain. Grossiste en emballage alimentaire et accessoires pour professionnels en Belgique.',
  icons: {
    icon: '/logo-tab.png',
  },
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
            {/* Top Bar */}
            <a href="#footer" className="top-bar" style={{ textDecoration: 'none' }}>
              <div className="top-bar-ticker">
                {/* First group */}
                <div className="top-bar-group">
                  <div className="top-bar-item">
                    <Package size={14} />
                    <span>Tous types d'emballages et vente en gros</span>
                  </div>
                  <div className="top-bar-item">
                    <Clock size={14} />
                    <span>7/7 de 10h à 18h</span>
                  </div>
                  <div className="top-bar-item">
                    <Phone size={14} />
                    <span>+32 488 432 633</span>
                  </div>
                  <div className="top-bar-item">
                    <Mail size={14} />
                    <span>rayanback.belgium@gmail.com</span>
                  </div>
                </div>
                {/* Second group (duplicate for seamless loop) */}
                <div className="top-bar-group" aria-hidden="true">
                  <div className="top-bar-item">
                    <Package size={14} />
                    <span>Tous types d'emballages et vente en gros</span>
                  </div>
                  <div className="top-bar-item">
                    <Clock size={14} />
                    <span>7/7 de 10h à 18h</span>
                  </div>
                  <div className="top-bar-item">
                    <Phone size={14} />
                    <span>+32 488 432 633</span>
                  </div>
                  <div className="top-bar-item">
                    <Mail size={14} />
                    <span>rayanback.belgium@gmail.com</span>
                  </div>
                </div>
              </div>
            </a>

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
            <footer id="footer" className="site-footer">
              <div className="footer-contact">
                <div className="footer-contact-item">
                  <Clock size={20} />
                  <span className="footer-contact-label">Horaires</span>
                  <span className="footer-contact-value">7/7 de 10h à 18h</span>
                </div>
                <a href="tel:+32488432633" className="footer-contact-item" style={{ cursor: 'pointer' }}>
                  <Phone size={20} />
                  <span className="footer-contact-label">Téléphone</span>
                  <span className="footer-contact-value">+32 488 432 633</span>
                </a>
                <a href="mailto:rayanback.belgium@gmail.com" className="footer-contact-item" style={{ cursor: 'pointer' }}>
                  <Mail size={20} />
                  <span className="footer-contact-label">Email</span>
                  <span className="footer-contact-value">rayanback.belgium@gmail.com</span>
                </a>
              </div>
              <div style={{ marginTop: '24px' }}>
                &copy; {new Date().getFullYear()} RAYAN BACK. Tous droits réservés.
                <br />
                Développé par <a href="http://www.webora-da.be" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Webora</a>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
