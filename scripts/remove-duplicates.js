const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'public', 'database.json');
const rawData = fs.readFileSync(dbPath, 'utf8');
const items = JSON.parse(rawData);

const uniqueItems = [];
const seenIds = new Set();
let removedCount = 0;

for (const item of items) {
    if (seenIds.has(item.id)) {
        console.log(`[REMOVED DUPLICATE] ID: ${item.id} | Image: ${item.image}`);
        removedCount++;

        // Attempt to delete the physical image file for the duplicate
        const imagePath = path.join(__dirname, '..', 'public', item.image.replace(/^\//, ''));
        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
                console.log(`  -> Deleted duplicate physical file: ${item.image}`);
            } catch (err) {
                console.error(`  -> Failed to delete duplicate physical file: ${err.message}`);
            }
        }
    } else {
        seenIds.add(item.id);
        uniqueItems.push(item);
    }
}

fs.writeFileSync(dbPath, JSON.stringify(uniqueItems, null, 2));
console.log(`\nSuccessfully removed ${removedCount} duplicate entries from database.json.`);
