const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'public', 'database.json');
const rawData = fs.readFileSync(dbPath, 'utf8');
let items = JSON.parse(rawData);

// HORECA Packaging Dictionary mapping Regex to Replacement text
const corrections = [
    // Types
    { match: /\b(Borquette|Barquerte|Barquents|Sarquette|Batquette|Barquatte)\b/gi, replace: 'Barquette' },
    { match: /\b(Zouvercle|Zouvercte|Couvercie|Cuvercle|Couvercte)\b/gi, replace: 'Couvercle' },
    { match: /\b(Saladter|Salagier)\b/gi, replace: 'Saladier' },
    { match: /\b(Bolisoupe)\b/gi, replace: 'Bol à soupe' },
    { match: /\b(Laguettes)\b/gi, replace: 'Baguettes' },
    { match: /\b(Cutllere|Uillères|Cuillere)\b/gi, replace: 'Cuillère' },
    { match: /\b(Servientes)\b/gi, replace: 'Serviettes' },

    // Materials and Modifiers
    { match: /\b(ssiade)\b/gi, replace: 'salade' },
    { match: /\b(aluminiuir|alunintum|oluminium|aluminiur|slumineur|olumineur|sluminium|ajumuniur|alumimum|al)\b/gi, replace: 'aluminium' },
    { match: /\b(traiteur)\b/gi, replace: 'traiteur' },
    { match: /\b(trarteur)\b/gi, replace: 'traiteur' },
    { match: /\b(Ploteou|Platcau)\b/gi, replace: 'Plateau' },
    { match: /\b(octogonat|sctogonal|octoganal|octogonai)\b/gi, replace: 'octogonal' },
    { match: /\b(kraît|KraftiPE)\b/gi, replace: 'kraft' },
    { match: /\b(caté)\b/gi, replace: 'café' },
    { match: /\b(bors)\b/gi, replace: 'bois' },
    { match: /\b(tabie|\[able|_|__)\b/gi, replace: 'table' },
    { match: /\b(pzza|przz3)\b/gi, replace: 'pizza' },
    { match: /\b(eron)\b/gi, replace: 'citron' },
    { match: /\b(roule)\b/gi, replace: 'roulé' },
    { match: /\b(releve)\b/gi, replace: 'relevé' },
    { match: /Gants d.hygiène/gi, replace: "Gants d'hygiène" },
];

let changedCount = 0;

items = items.map(item => {
    // Only apply to items the user hasn't manually fixed yet
    if (item.id > "00-2664") {
        let oldName = item.name;
        let newName = oldName;

        // Apply all fixes
        for (const rule of corrections) {
            newName = newName.replace(rule.match, rule.replace);
        }

        // Clean up double spaces created by regex combinations or trailing underscores
        newName = newName.replace(/\s+/g, ' ').trim();
        if (newName.endsWith(' de table') && oldName !== newName) {
            // handle edge cases where " de _" became " de table" 
        }

        if (oldName !== newName) {
            console.log(`[FIXED] ${item.id}: "${oldName}" -> "${newName}"`);
            item.name = newName;
            changedCount++;
        }
    }
    return item;
});

// Resave the database
fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
console.log(`\nSuccessfully fixed ${changedCount} catalog items matching HORECA dictionary errors.`);
