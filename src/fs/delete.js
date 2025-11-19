const fs = require('fs').promises;
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../../data/projects');
const INDEX_FILE = path.join(__dirname, '../../data/project_index.json');

async function deleteProject(projectId) {
    const filename = `project_${projectId}.json`;
    const filepath = path.join(PROJECTS_DIR, filename);
    
    try {

        await fs.access(filepath);

        await fs.unlink(filepath);

        const indexData = await fs.readFile(INDEX_FILE, 'utf8');
        const index = JSON.parse(indexData);
        
        const updatedIndex = index.filter(project => project.id !== projectId);
        await fs.writeFile(INDEX_FILE, JSON.stringify(updatedIndex, null, 2));
        
        return true;
    } catch (error) {
        throw error;
    }
}

async function removeProject() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Использование: node src/fs/delete.js <ID_проекта>');
        process.exit(1);
    }

    const projectId = args[0];
    
    try {
        await deleteProject(projectId);
        console.log(`Проект с ID ${projectId} успешно удален`);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Проект не найден');
        } else {
            console.error('Ошибка при удалении проекта:', error.message);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    removeProject();
}

module.exports = { deleteProject };