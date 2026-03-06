import fs from 'fs';
import path from 'path';
import CatalogManager from '@/components/CatalogManager';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Truck, Clock, ShieldCheck } from 'lucide-react';

export default function Home() {
  // Read local database.json 
  let data = [];
  try {
    const filePath = path.join(process.cwd(), 'public', 'database.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    console.error("Database not found, please run data extraction first.");
    data = [
      {
        id: "00-0000",
        name: "Aucun produit trouvé (Extraction requise)",
        category: "Erreur",
        image: "/placeholder.png", // Next.js will error without an image, but it's okay for empty state
        tags: []
      }
    ];
  }

  return (
    <>
      {/* Hero Banner Section */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">🇧🇪 Grossiste N°1 en Belgique</div>
          <h1 className="hero-title">L'emballage professionnel, <span>livré demain.</span></h1>
          <p className="hero-subtitle">
            Commandez aujourd'hui avant 18h, recevez votre marchandise dès demain partout en Belgique. Large choix de contenants et accessoires pour votre activité.
          </p>
          <div className="hero-features">
            <div className="feature"><Truck size={20} /> Livraison Express</div>
            <div className="feature"><Clock size={20} /> Service Rapide</div>
            <div className="feature"><ShieldCheck size={20} /> Qualité Pro</div>
          </div>
          <a
            href="#catalog-section"
            className="hero-cta"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            Découvrir le catalogue
          </a>
        </div>
      </div>

      <div id="catalog-section">
        <CatalogManager initialData={data} />
      </div>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </>
  );
}
