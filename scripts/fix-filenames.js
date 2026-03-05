const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const itemsDir = path.join(process.cwd(), 'public', 'items');

async function renameMismatchedFiles() {
    const files = fs.readdirSync(itemsDir).filter(f => f.startsWith('item_r') && f.endsWith('.png'));
    if (files.length === 0) {
        console.log("Aucun fichier mal nommé trouvé.");
        return;
    }

    console.log(`Analyzing ${files.length} mismatched files to find their true IDs...`);
    const worker = await Tesseract.createWorker('fra');

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(itemsDir, file);

        try {
            // The ID is ALWAYS at the very bottom, below the blue line.
            // We will perform a focused crop on the bottom 15% of the image.
            const metadata = await sharp(filePath).metadata();
            const cropTop = Math.floor(metadata.height * 0.85); // Bottom 15%
            const cropHeight = Math.floor(metadata.height * 0.15); // Bottom 15%
            const cropLeft = Math.floor(metadata.width * 0.10); // Crop margins
            const cropWidth = Math.floor(metadata.width * 0.80);

            const buffer = await sharp(filePath)
                .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
                .resize({ width: 1200, withoutEnlargement: true }) // Upscale to improve reading
                .normalize() // Maximize contrast
                .grayscale() // Convert to grayscale
                .threshold(160) // High threshold for clean black and white numbers
                .toBuffer();

            const ret = await worker.recognize(buffer);
            const text = ret.data.text.trim();

            // Look for the standard ID pattern 
            const idMatch = text.match(/(\d{2}-\d{4})/);

            if (idMatch) {
                const id = idMatch[1];
                const newFileName = `${id}.png`;
                const newFilePath = path.join(itemsDir, newFileName);

                // Ensure we don't accidentally overwrite an existing valid image
                if (!fs.existsSync(newFilePath)) {
                    fs.renameSync(filePath, newFilePath);
                    console.log(`Renamed: ${file}  ->  ${newFileName}`);
                } else {
                    console.log(`Skip: ${file} (Target ${newFileName} already exists)`);
                }
            } else {
                console.log(`Failed to find ID for: ${file} (Text seen: "${text}")`);
            }
        } catch (err) {
            console.error(`Error processing ${file}: ${err.message}`);
        }
    }

    await worker.terminate();
    console.log("Done renaming mismatched files.");
}

renameMismatchedFiles();
