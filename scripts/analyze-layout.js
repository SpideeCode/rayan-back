const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

const itemsDir = path.join(process.cwd(), 'public', 'items');
const sampleFile = path.join(itemsDir, '00-2539.png'); // "OCTAVIEW"
const sampleFile2 = path.join(itemsDir, '00-2781.png'); // "Serviuties de table" -> "Serviettes"

async function analyzeLayout(filePath) {
    if (!fs.existsSync(filePath)) return;
    console.log(`\n--- Analyzing Layout for ${path.basename(filePath)} ---`);
    const metadata = await sharp(filePath).metadata();
    console.log(`Dimensions: ${metadata.width}x${metadata.height}`);

    const worker = await Tesseract.createWorker('fra');

    const numSlices = 5;
    const sliceHeight = Math.floor(metadata.height / numSlices);

    for (let i = 0; i < numSlices; i++) {
        const top = i * sliceHeight;
        const buffer = await sharp(filePath)
            .extract({ left: 0, top: top, width: metadata.width, height: sliceHeight })
            .normalize()
            .grayscale()
            .threshold(160)
            .toBuffer();

        const ret = await worker.recognize(buffer);
        const text = ret.data.text.trim().replace(/\n/g, '  |  ');
        console.log(`Slice ${i + 1} (${(i / numSlices * 100).toFixed(0)}% - ${((i + 1) / numSlices * 100).toFixed(0)}%): ${text ? text : '[EMPTY]'}`);
    }
    await worker.terminate();
}

async function run() {
    await analyzeLayout(sampleFile);
    await analyzeLayout(sampleFile2);
}

run();
