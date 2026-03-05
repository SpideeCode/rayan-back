const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const itemsDir = path.join(process.cwd(), 'public', 'items');
const outputFile = path.join(process.cwd(), 'public', 'database.json');

async function processImages() {
  const files = fs.readdirSync(itemsDir).filter(f => f.match(/\.(png|jpe?g)$/i));
  const database = [];
  const seenIds = new Set();

  // Initialize Tesseract Worker
  const worker = await Tesseract.createWorker('fra');

  // Dictionary for contextual correction
  const corrections = {
    "faurchatte": "Fourchette",
    "falrchatte": "Fourchette",
    "salacher": "Saladier",
    "serviuties": "Serviettes",
    "serviet": "Serviettes",
    "gobaiel": "Gobelet",
    "gobslet": "Gobelet",
    "couteeu": "Couteau",
    "couvesrt": "Couvert",
    "bols": "Bol",
    "etes": "Frites",
    "as assiettes": "Assiettes"
  };

  function applyCorrections(name) {
    let correctedName = name;
    for (const [wrong, right] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      if (correctedName.match(regex)) {
        correctedName = correctedName.replace(regex, right);
      }
    }
    return correctedName.charAt(0).toUpperCase() + correctedName.slice(1);
  }

  // Heuristic fallback categories
  const categoryFallbacks = {
    "00-20": "Boîte", "00-21": "Boîte", "00-22": "Barquette", "00-23": "Barquette",
    "00-24": "Pot", "00-25": "Gobelet", "00-26": "Assiette", "00-27": "Couvert",
    "00-28": "Sachet plastique", "00-29": "Sac papier", "00-30": "Serviette", "00-31": "Accessoire"
  };

  console.log(`Starting OCR on ${files.length} images...`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(itemsDir, file);
    try {
      console.log(`[${i + 1}/${files.length}] Processing: ${file}`);

      // Aggressive Pre-processing with Sharp: Crop specifically to the Bottom holding the Name in bold
      const metadata = await sharp(filePath).metadata();
      const cropTop = Math.floor(metadata.height * 0.60); // Start at 60% down
      const cropHeight = Math.floor(metadata.height * 0.35); // Scan from 60% to 95% down
      const cropLeft = Math.floor(metadata.width * 0.05); // Margin
      const cropWidth = Math.floor(metadata.width * 0.90); // Margin

      const buffer = await sharp(filePath)
        .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
        .resize({ width: 1200, withoutEnlargement: true }) // Upscale to improve reading
        .normalize() // Maximize contrast
        .grayscale() // Convert to gray
        .threshold(140) // Heavy threshold to kill backgrounds/logos
        .toBuffer();

      // Step 2: Extract text
      const ret = await worker.recognize(buffer);
      const text = ret.data.text;

      // Extract Reference. ALWAYS Prioritize identifying ID from filename.
      const nameMatch = file.match(/(\d{2}-\d{4})/);
      let id = "";
      if (nameMatch) {
        id = nameMatch[1];
      } else {
        const fullBufferText = (await worker.recognize(await sharp(filePath).grayscale().toBuffer())).data.text;
        const idMatch = fullBufferText.match(/\b(\d{2}-\d{4})\b/);
        id = idMatch ? idMatch[1] : `ID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      }

      // Name extraction
      let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      lines = lines.filter(l => !l.match(/\d{2}-\d{4}/) && !l.match(/^[_\W0-9]+$/)); // Remove ID strings & gibberish

      let name = "";
      if (lines.length > 0) {
        name = lines[0];
        name = name.replace(/^[^a-zA-Z0-9À-ÿ]+/, ''); // Clean up start
        name = applyCorrections(name);
      }

      // Fallback
      if (name.length < 4 || name.match(/^[_\W0-9]+$/)) {
        const prefix = id.substring(0, 5);
        name = `${categoryFallbacks[prefix] || "Article"} ${id}`;
      }

      // Characteristics tags (run on full image to catch small text)
      const fullBuffer = await sharp(filePath).grayscale().toBuffer();
      const fullText = (await worker.recognize(fullBuffer)).data.text;
      const tagRegex = /\b(PS|PET|PP|Carton|Aluminium|PLA|CPLA|Bagasse|Papier|\d+(?:[.,]\d+)?\s*(?:ml|cl|L|oz|mm|cm|g))\b/gi;
      const allTagsMatches = fullText.match(tagRegex);
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
