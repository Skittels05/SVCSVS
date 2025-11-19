const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const INDEX_FILE = path.join(DATA_DIR, 'project_index.json');

async function ensureDirectories() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir(PROJECTS_DIR, { recursive: true });

        try {
            await fs.access(INDEX_FILE);
        } catch {
            await fs.writeFile(INDEX_FILE, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Ошибка при создании директорий:', error);
        process.exit(1);
    }
}

async function createProject() {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.log('Использование: node src/fs/create.js "Название проекта" "Менеджер" "Статус" [Описание]');
        process.exit(1);
    }

    const [name, manager, status, description = ''] = args;
    
    try {
        await ensureDirectories();

        const id = Date.now().toString();
        const filename = `project_${id}.json`;
        const filepath = path.join(PROJECTS_DIR, filename);

        try {
            await fs.access(filepath);
            throw new Error('Ошибка операции FS: Запись уже существует');
        } catch (error) {
            if (error.message === 'Ошибка операции FS: Запись уже существует') {
                throw error;
            }

        }

        const project = {
            id,
            name,
            manager,
            status,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await fs.writeFile(filepath, JSON.stringify(project, null, 2));

        const indexData = await fs.readFile(INDEX_FILE, 'utf8');
        const index = JSON.parse(indexData);
        
        const indexEntry = {
            id,
            name,
            manager,
            status,
            filename
        };
        
        index.push(indexEntry);
        await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
        
        console.log(`Проект "${name}" успешно создан с ID: ${id}`);
        console.log(`Файл: ${filename}`);
        
    } catch (error) {
        console.error('Ошибка при создании проекта:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    createProject();
}

module.exports = { createProject, ensureDirectories };