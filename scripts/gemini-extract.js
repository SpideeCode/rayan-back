require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Initialiser le client
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey || apiKey.includes("PLACEHOLDER")) {
    console.error("ERREUR FATALE: Clé API non trouvée ou invalide. Définissez GOOGLE_GEMINI_API_KEY dans .env");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

// 2. Sélectionner le bon modèle (Flash-lite pour la vitesse)
const model = genAI.getGenerativeModel(
    { model: 'gemini-flash-lite-latest' },
    { apiVersion: 'v1beta' }
);

const itemsDir = path.join(process.cwd(), 'public', 'items');
const outputFile = path.join(process.cwd(), 'public', 'database.json');

async function processImagesWithGemini() {
    const files = fs.readdirSync(itemsDir).filter(f => f.match(/\.(png|jpe?g)$/i));
    const database = [];
    const seenIds = new Set();

    console.log(`Starting Vision OCR on ${files.length} images using Gemini Flash Lite Latest...`);

    const prompt = `
  Tu es un expert en extraction de catalogue. Analyse cette image de produit et renvoie un objet JSON VALIDE avec ces 4 propriétés exactes :
  1. "id": La référence du produit. C'est le texte comme 00-2539. C'est TRÈS important de ne pas confondre les chiffres (les 9, les 3, les 8 etc).
  2. "name": Le nom complet du produit écrit en gras (généralement juste au dessus de la petite ligne bleue). Ne garde QUE ce nom de produit, ignore les logos, et ignore la référence (00-XXXX). Ex: "Boîte à hamburger".
  3. "category": Choisis UNE catégorie parmi : "Boîtes", "Gobelets", "Couverts", "Sachets", "Bols", "Assiettes", "Serviettes", "Autres".
  4. "tags": Un tableau de caractéristiques (matière Ex: PET, PP, PS, Carton... ou volume/dimension Ex: 400ml, 15cm). Si rien n'est trouvé, mets un tableau vide [].
  
  Ensure the output is strictly valid JSON with no markdown formatting.
  `;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(itemsDir, file);
        const mimeType = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

        try {
            console.log(`[${i + 1}/${files.length}] Analyzing: ${file}`);

            // 4. Convertir le Fichier en Base64
            const fileBuffer = fs.readFileSync(filePath);
            const base64Data = fileBuffer.toString('base64');

            // Provide resilient Exponential Backoff Retry mechanism for Rate Limits
            let result = null;
            let retries = 0;
            let maxRetries = 10; // Increase max retries
            let backoffMs = 15000; // Start with a hefty 15 second delay on first 429

            while (retries < maxRetries && !result) {
                try {
                    result = await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType,
                            },
                        },
                    ]);
                } catch (apiError) {
                    if (apiError.status === 429 || (apiError.message && apiError.message.includes("429"))) {
                        console.warn(`    ⚠️ Rate limit hit (429). Retrying in ${backoffMs / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, backoffMs));
                        backoffMs = Math.min(backoffMs * 1.5, 60000); // Exponential Backoff up to 60s
                        retries++;
                    } else if (apiError.status === 503 || (apiError.message && apiError.message.includes("overloaded"))) {
                        console.warn(`    ⚠️ Model overloaded (503). Retrying in ${backoffMs / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, backoffMs));
                        backoffMs = Math.min(backoffMs * 1.5, 60000);
                        retries++;
                    } else {
                        throw apiError; // Throw other errors to the main catch block
                    }
                }
            }

            if (!result) {
                throw new Error("Max retries exceeded evaluating image.");
            }

            const text = (await result.response).text();

            // 7. Post-traitement : Nettoyer le format Markdown 
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            let itemData = JSON.parse(cleanedText);

            // Deduplicate keys fallback
            let id = itemData.id;
            // If AI failed to find ID, try to get from filename
            if (!id || !id.match(/\d{2}-\d{4}/)) {
                const nameMatch = file.match(/(\d{2}-\d{4})/);
                if (nameMatch) id = nameMatch[1];
            }

            let originalId = id;
            let counter = 1;
            while (seenIds.has(id)) {
                id = `${originalId}-${counter}`;
                counter++;
            }
            seenIds.add(id);

            // Enforce specific format
            database.push({
                id: id,
                name: itemData.name || `Article ${id}`,
                category: itemData.category || "Autres",
                image: `/items/${file}`,
                tags: Array.isArray(itemData.tags) ? itemData.tags : []
            });

            // Update file every 50 to track progress
            if ((i + 1) % 50 === 0) {
                fs.writeFileSync(outputFile, JSON.stringify(database, null, 2));
            }

        } catch (err) {
            console.error(`Error with ${file}:`, err.message || err);
            // Fallback on error to avoid losing the file completely
            database.push({
                id: file.replace(/\.(png|jpe?g)$/i, ''),
                name: "Erreur Analyse",
                category: "Autres",
                image: `/items/${file}`,
                tags: []
            });
        }
        // Add strict standard delay to respect global 15 RPM free tier thresholds (10 seconds per request = 6 RPM)
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // Final Save
    fs.writeFileSync(outputFile, JSON.stringify(database, null, 2));
    console.log(`\n✅ Gemini Extraction terminée ! Sauvés ${database.length} éléments vers ${outputFile}`);
}

processImagesWithGemini();
