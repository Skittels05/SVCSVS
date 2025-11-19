const fs = require('fs').promises;
const path = require('path');

const INDEX_FILE = path.join(__dirname, '../../data/project_index.json');

async function listProjects() {
    try {
        const data = await fs.readFile(INDEX_FILE, 'utf8');
        const projects = JSON.parse(data);
        return projects;
    } catch (error) {
        throw error;
    }
}

async function displayProjects() {
    try {
        const projects = await listProjects();
        
        if (projects.length === 0) {
            console.log('📭 Проекты не найдены');
            return;
        }
        
        console.log('Список проектов:');        
        projects.forEach((project, index) => {
            console.log(`${index + 1}. ${project.name}`);
            console.log(`   ID: ${project.id}`);
            console.log(`   Менеджер: ${project.manager}`);
            console.log(`   Статус: ${project.status}`);
            console.log(`   Файл: ${project.filename}`);
            console.log('───────────────────────');
        });
        
        console.log(`Всего проектов: ${projects.length}`);
        
    } catch (error) {
        console.error('Ошибка при получении списка проектов:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    displayProjects();
}

module.exports = { listProjects };