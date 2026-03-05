const sharp = require('sharp');
const path = require('path');

async function processLogo() {
    try {
        const inputPath = path.join(__dirname, '..', 'public', 'logo-rayan.png');
        const outputPath = path.join(__dirname, '..', 'public', 'logo.png');

        const { data, info } = await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // The background is purple grid. The logo is orange/yellow.
            // Purple has higher Blue than Green. Orange has much higher Green than Blue.
            // Typical orange: R=255, G=165, B=0
            // Typical purple: R=128, G=0, B=128
            // If it's not strongly orange/yellow, we make it transparent.
            // Orange/Yellow characteristics: High Red, High/Medium Green, Low Blue.
            if (r > 100 && g > 70 && b < 100 && r > b + 30) {
                // Keep it (it's orange/yellow text or logo)
            } else {
                // Make it perfectly transparent
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 0; // Alpha channel = 0 (transparent)
            }
        }

        await sharp(data, { raw: info })
            .png()
            .toFile(outputPath);

        console.log('Logo background removed securely (now transparent) and saved to logo.png');
    } catch (err) {
        console.error('Error processing logo:', err);
    }
}

processLogo();
