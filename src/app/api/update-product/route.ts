import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { originalId, newId, newName } = await req.json();

        if (!originalId || !newId || !newName) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const databasePath = path.join(process.cwd(), 'public', 'database.json');
        const itemsDir = path.join(process.cwd(), 'public', 'items');

        // Read Database
        const fileContents = fs.readFileSync(databasePath, 'utf8');
        let data = JSON.parse(fileContents);

        const productIndex = data.findIndex((p: any) => p.id === originalId);
        if (productIndex === -1) {
            return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
        }

        const product = data[productIndex];
        let newImagePath = product.image;

        // Handle ID change -> Rename physical file
        if (originalId !== newId) {
            const oldFileName = product.image.split('/').pop();
            const newFileName = `${newId}.png`; // Assuming PNG for simplicity based on previous scripts

            const oldFilePath = path.join(itemsDir, oldFileName);
            const newFilePath = path.join(itemsDir, newFileName);

            // Only rename if old file exists and new doesn't conflict
            if (fs.existsSync(oldFilePath) && !fs.existsSync(newFilePath)) {
                fs.renameSync(oldFilePath, newFilePath);
                newImagePath = `/items/${newFileName}`;
            } else if (fs.existsSync(newFilePath)) {
                // If the target file already exists, we will still update the JSON but not rename to avoid destroying files
                newImagePath = `/items/${newFileName}`;
            }
        }

        // Update product object
        data[productIndex] = {
            ...product,
            id: newId,
            name: newName,
            image: newImagePath
        };

        // Write back to database.json
        fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true, product: data[productIndex] });

    } catch (error: any) {
        console.error('Update Product Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
