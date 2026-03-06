import fs from 'fs';
import path from 'path';
import CatalogManager from '@/components/CatalogManager';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

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
      <CatalogManager initialData={data} />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </>
  );
}
