const fs = require('fs');
const path = require('path');
const itemsDir = path.join(process.cwd(), 'public', 'items');

// The user specified that ALL product IDs must start with "00-"
console.log('Scanning for invalid prefixes...');
const files = fs.readdirSync(itemsDir);

let changed = 0;
let deleted = 0;

files.forEach(file => {
    // Find files shaped like XX-XXXX.png that DO NOT start with 00-
    if (file.match(/^\d{2}-\d{4}\.(png|jpe?g)$/i) && !file.startsWith('00-')) {
        const newName = '00-' + file.substring(3);
        const oldPath = path.join(itemsDir, file);
        const newPath = path.join(itemsDir, newName);

        if (!fs.existsSync(newPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`[FIXED] Renamed: ${file} -> ${newName}`);
            changed++;
        } else {
            console.log(`[DUPLICATE] ${newName} already exists. Removing bad copy ${file}.`);
            fs.unlinkSync(oldPath);
            deleted++;
        }
    }
});

console.log(`Completed. Renamed ${changed} files. Removed ${deleted} duplicates.`);
