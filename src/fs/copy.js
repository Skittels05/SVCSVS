const fs = require('fs').promises;
const path = require('path');

async function copyDirectory(source, destination) {
    try {

        await fs.mkdir(destination, { recursive: true });
        const entries = await fs.readdir(source, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(source, entry.name);
            const destPath = path.join(destination, entry.name);
            
            if (entry.isDirectory()) {
                await copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
        
        return true;
    } catch (error) {
        throw error;
    }
}

async function createBackup() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Использование: node src/fs/copy.js <исходная_папка> <целевая_папка>');
        process.exit(1);
    }

    const [source, destination] = args;
    
    try {
        await fs.access(source);
        await copyDirectory(source, destination);
        console.log(`Резервная копия создана: ${source} -> ${destination}`);
        
    } catch (error) {
        console.error('Ошибка при создании резервной копии:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    createBackup();
}

module.exports = { copyDirectory };