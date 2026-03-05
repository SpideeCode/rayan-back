const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const itemsDir = path.join(process.cwd(), 'public', 'items');
const outputFile = path.join(process.cwd(), 'public', 'database.json');

async function processImages() {
  const files = fs.readdirSync(itemsDir).filter(f => f.match(/\.(png|jpe?g)$/i));
  const database = [];
  
  // Initialize Tesseract Worker
  const worker = await Tesseract.createWorker('fra');

  console.log(`Starting OCR on ${files.length} images...`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(itemsDir, file);
    try {
      console.log(`[${i+1}/${files.length}] Processing: ${file}`);
      
      // Step 1: Pre-processing with Sharp (Grayscale to improve OCR precision by 30%)
      const buffer = await sharp(filePath)
        .grayscale()
        .toBuffer();

      // Step 2: Extract text
      const ret = await worker.recognize(buffer);
      const text = ret.data.text;

      // Extract Reference (Strict Regex: \d{2}-\d{4})
      const idMatch = text.match(/\b(\d{2}-\d{4})\b/);
      let id = "";
      if (idMatch) {
         id = idMatch[1];
      } else {
         const nameMatch = file.match(/(\d{2}-\d{4})/);
         id = nameMatch ? nameMatch[1] : `ID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      }

      // Name extraction
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      // Remove lines consisting primarily of the id
      const nameLines = lines.filter(l => !l.match(/\d{2}-\d{4}/));
      let name = nameLines.length > 0 ? nameLines[0] : "Produit " + id;
      name = name.replace(/^[^a-zA-Z0-9À-ÿ]+/, ''); // Clean up special chars at string start

      // Characteristics tags
      const tagRegex = /\b(PS|PET|PP|Carton|Aluminium|PLA|CPLA|Bagasse|Papier|\d+(?:,\d+)?\s*(?:ml|cl|L|oz|mm|cm|g))\b/gi;
      const allTagsMatches = text.match(tagRegex);
      let tags = [];
      if (allTagsMatches) {
        tags = [...new Set(allTagsMatches.map(t => t.toUpperCase().replace(/\s/g, '')))];
      }

      // Infer Category
      let category = "Autres";
      const lowerName = name.toLowerCase();
      if (lowerName.includes('boît') || lowerName.includes('box') || lowerName.includes('barquette') || lowerName.includes('octaview')) category = "Boîtes";
      else if (lowerName.includes('gobelet') || lowerName.includes('verre') || lowerName.includes('tasse') || lowerName.includes('coupe')) category = "Gobelets";
      else if (lowerName.includes('couvert') || lowerName.includes('fourchette') || lowerName.includes('couteau') || lowerName.includes('cuillère')) category = "Couverts";
      else if (lowerName.includes('sachet') || lowerName.includes('sac')) category = "Sachets";
      else if (lowerName.includes('bol') || lowerName.includes('saladier') || lowerName.includes('pot')) category = "Bols";
      else if (lowerName.includes('assiette') || lowerName.includes('plateau')) category = "Assiettes";
      else if (lowerName.includes('serviette') || lowerName.includes('essuie')) category = "Serviettes";

      database.push({
        id,
        name,
        category,
        image: `/items/${file}`,
        tags
      });

    } catch (err) {
      console.error(`Error with ${file}:`, err);
    }
  }

  await worker.terminate();
  fs.writeFileSync(outputFile, JSON.stringify(database, null, 2));
  console.log(`Saved extracted data to ${outputFile}`);
}

processImages();
