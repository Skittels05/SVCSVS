const fs = require('fs').promises;
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../../data/projects');
const INDEX_FILE = path.join(__dirname, '../../data/project_index.json');

async function renameProjectFile(oldFilename, newFilename) {
    const oldPath = path.join(PROJECTS_DIR, oldFilename);
    const newPath = path.join(PROJECTS_DIR, newFilename);
    
    try {

        await fs.access(oldPath);

        try {
            await fs.access(newPath);
            throw new Error('Файл с новым именем уже существует');
        } catch {
        }

        await fs.rename(oldPath, newPath);
        const indexData = await fs.readFile(INDEX_FILE, 'utf8');
        const index = JSON.parse(indexData);
        
        const projectIndex = index.findIndex(project => project.filename === oldFilename);
        if (projectIndex !== -1) {
            index[projectIndex].filename = newFilename;
            await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
        }
        
        return true;
    } catch (error) {
        throw error;
    }
}

async function renameFile() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Использование: node src/fs/rename.js <старое_имя> <новое_имя>');
        process.exit(1);
    }

    const [oldFilename, newFilename] = args;
    
    try {
        await renameProjectFile(oldFilename, newFilename);
        console.log(`Файл успешно переименован: ${oldFilename} -> ${newFilename}`);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Исходный файл не найден');
        } else {
            console.error('Ошибка при переименовании:', error.message);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    renameFile();
}

module.exports = { renameProjectFile };