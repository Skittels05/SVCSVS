const fs = require('fs').promises;
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../../data/projects');

async function readProject(projectId) {
    const filename = `project_${projectId}.json`;
    const filepath = path.join(PROJECTS_DIR, filename);
    
    try {
        const data = await fs.readFile(filepath, 'utf8');
        const project = JSON.parse(data);
        return project;
    } catch (error) {
        throw error;
    }
}

async function displayProject() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Использование: node src/fs/read.js <ID_проекта>');
        process.exit(1);
    }

    const projectId = args[0];
    
    try {
        const project = await readProject(projectId);
        
        console.log('Информация о проекте:');
        console.log(`ID: ${project.id}`);
        console.log(`Название: ${project.name}`);
        console.log(`Менеджер: ${project.manager}`);
        console.log(`Статус: ${project.status}`);
        console.log(`Описание: ${project.description}`);
        console.log(`Создан: ${new Date(project.createdAt).toLocaleString()}`);
        console.log(`Обновлен: ${new Date(project.updatedAt).toLocaleString()}`);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Проект не найден');
        } else {
            console.error('Ошибка при чтении проекта:', error.message);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    displayProject();
}

module.exports = { readProject };