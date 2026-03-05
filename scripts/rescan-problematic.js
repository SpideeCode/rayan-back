const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

const itemsDir = path.join(process.cwd(), 'public', 'items');
const outputFile = path.join(process.cwd(), 'public', 'database.json');

// List of problematic IDs based on user feedback
const problemIds = [
    "00-2077", "00-2520", "00-2521", "00-2533", "00-2574", "00-2612", "00-2622", "00-2623",
    "00-2689", "00-2713", "00-2714", "00-2715", "00-2729", "00-2730", "00-2732", "00-2748",
    "00-2765", "00-2775", "00-2781", "00-2804", "00-2806", "00-2808", "00-2810", "00-2814",
    "00-2818", "00-2830", "00-2832", "00-2866", "00-2874", "00-2883", "00-2885", "00-2908",
    "00-2910", "00-2912", "00-2915", "00-2919", "00-2920", "00-2952", "00-2953", "00-2955",
    "00-2958", "00-2971", "00-3002", "00-3038", "00-3117", "00-3118", "00-3120", "00-3129",
    "00-3130", "00-3139", "00-3140", "00-3141", "00-3156", "00-3157", "00-3166"
];

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

// Heuristic fallback categories with dimensions
const categoryFallbacks = {
    "00-20": "Boîte",
    "00-21": "Boîte",
    "00-22": "Barquette",
    "00-23": "Barquette",
    "00-24": "Pot",
    "00-25": "Gobelet",
    "00-26": "Assiette",
    "00-27": "Couvert",
    "00-28": "Sachet plastique",
    "00-29": "Sac papier",
    "00-30": "Serviette",
    "00-31": "Accessoire"
};

function getFallbackName(id, text) {
    const prefix = id.substring(0, 5);
    const category = categoryFallbacks[prefix] || "Article";

    // try to find dimension in text (e.g 15x15, 200ml)
    const dimMatch = text.match(/(\d+(?:[.,]\d+)?\s*(?:mm|cm|ml|cl|L|g|oz))/i);
    if (dimMatch) {
        return `${category} ${dimMatch[1]}`;
    }
    return `${category} ${id}`;
}

function applyCorrections(name) {
    let correctedName = name;
    for (const [wrong, right] of Object.entries(corrections)) {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        if (correctedName.match(regex)) {
            correctedName = correctedName.replace(regex, right);
        }
    }
    // Capitalize first letter
    return correctedName.charAt(0).toUpperCase() + correctedName.slice(1);
}

async function processProblemImages() {
    if (!fs.existsSync(outputFile)) {
        console.error("database.json not found!");
        return;
    }

    const dbData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    const worker = await Tesseract.createWorker('fra');

    console.log(`Starting targeted OCR rescan on ${problemIds.length} problematic images...`);

    for (let i = 0; i < problemIds.length; i++) {
        const targetId = problemIds[i];

        // Find the item in our DB to get its filename
        const dbIndex = dbData.findIndex(item => item.id.startsWith(targetId));

        if (dbIndex === -1) {
            console.log(`[${i + 1}/${problemIds.length}] Skipping ${targetId}: Not found in DB.`);
            continue;
        }

        const item = dbData[dbIndex];
        // item.image is e.g. "/items/00-2520.png"
        const fileName = path.basename(item.image);
        const filePath = path.join(itemsDir, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`[${i + 1}/${problemIds.length}] Skipping ${targetId}: File ${fileName} not found.`);
            continue;
        }

        try {
            console.log(`[${i + 1}/${problemIds.length}] Rescanning: ${fileName}`);

            const metadata = await sharp(filePath).metadata();

            // We need to target the bold text. Usually it's in the upper to middle-upper section.
            // And we want to avoid logos which are often on the top left or far right.
            // We'll crop the image to focus on the central top section.
            const cropTop = Math.floor(metadata.height * 0.10);
            const cropHeight = Math.floor(metadata.height * 0.40); // 10% to 50% down
            const cropLeft = Math.floor(metadata.width * 0.15); // cut out left margins
            const cropWidth = Math.floor(metadata.width * 0.70); // cut out right margins

            const buffer = await sharp(filePath)
                .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
                .resize({ width: 1200, withoutEnlargement: true })
                .normalize()
                .grayscale()
                .threshold(140) // lower threshold to catch fainter bold text, avoid deep dark logos
                .toBuffer();

            const ret = await worker.recognize(buffer);
            const text = ret.data.text;

            // Clean the text
            let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);

            // Remove lines matching IDs or common garbage
            lines = lines.filter(l => !l.match(/\d{2}-\d{4}/) && !l.match(/^[_\W0-9]+$/));

            let newName = "";

            if (lines.length > 0) {
                // Sort lines by length, assume the longest valid line is the title string
                // or just take the first valid line
                newName = lines[0];
                newName = newName.replace(/^[^a-zA-Z0-9À-ÿ]+/, ''); // Clean up start
                newName = applyCorrections(newName);
            }

            // If the extracted name is still too short, gibberish, or empty, use fallback Category + Dimensions
            if (newName.length < 4 || newName.match(/^[_\W0-9]+$/)) {
                // Fallback to reading the full original uncropped image for dimension tags
                const fullBuffer = await sharp(filePath).grayscale().toBuffer();
                const fullRet = await worker.recognize(fullBuffer);
                newName = getFallbackName(targetId, fullRet.data.text);
            }

            console.log(`   -> Old name: "${item.name}"`);
            console.log(`   -> New name: "${newName}"`);

            // Update DB entry
            dbData[dbIndex].name = newName;

            // Re-evaluate Category based on new name
            let category = item.category;
            const lowerName = newName.toLowerCase();
            if (lowerName.includes('boît') || lowerName.includes('box') || lowerName.includes('barquette') || lowerName.includes('octaview')) category = "Boîtes";
            else if (lowerName.includes('gobelet') || lowerName.includes('verre') || lowerName.includes('tasse') || lowerName.includes('coupe')) category = "Gobelets";
            else if (lowerName.includes('couvert') || lowerName.includes('fourchette') || lowerName.includes('couteau') || lowerName.includes('cuillère')) category = "Couverts";
            else if (lowerName.includes('sachet') || lowerName.includes('sac')) category = "Sachets";
            else if (lowerName.includes('bol') || lowerName.includes('saladier') || lowerName.includes('pot')) category = "Bols";
            else if (lowerName.includes('assiette') || lowerName.includes('plateau')) category = "Assiettes";
            else if (lowerName.includes('serviette') || lowerName.includes('essuie')) category = "Serviettes";

            dbData[dbIndex].category = category;

        } catch (err) {
            console.error(`Error rescanning ${fileName}:`, err);
        }
    }

    await worker.terminate();
    fs.writeFileSync(outputFile, JSON.stringify(dbData, null, 2));
    console.log(`\nSuccessfully updated database.json with rescanned data.`);
}

processProblemImages();
