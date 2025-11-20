const fs = require('fs').promises;
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../../data/projects');
const INDEX_FILE = path.join(__dirname, '../../data/project_index.json');

async function renameProject(projectId, newName) {
    try {
        const indexData = await fs.readFile(INDEX_FILE, 'utf8');
        const index = JSON.parse(indexData);
        const projectIndex = index.findIndex(project => project.id === projectId);
        if (projectIndex === -1) {
            throw new Error('Проект не найден');
        }

        const project = index[projectIndex];
        const oldFilename = project.filename;
        const filepath = path.join(PROJECTS_DIR, oldFilename);
        const oldName = project.name;
        index[projectIndex].name = newName;
        await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
        const projectData = await fs.readFile(filepath, 'utf8');
        const projectDetails = JSON.parse(projectData);
        projectDetails.name = newName;
        projectDetails.updatedAt = new Date().toISOString();
        
        await fs.writeFile(filepath, JSON.stringify(projectDetails, null, 2));

        return { oldName, newName };
    } catch (error) {
        throw error;
    }
}

async function renameProjectHandler() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Использование: node src/fs/rename.js <ID_проекта> "<новое_название>"');
        process.exit(1);
    }

    const [projectId, newName] = args;
    
    try {
        const result = await renameProject(projectId, newName);
        console.log(`Проект успешно переименован: "${result.oldName}" -> "${result.newName}"`);
        
    } catch (error) {
        if (error.message === 'Проект не найден') {
            console.error('Проект не найден');
        } else {
            console.error('Ошибка при переименовании:', error.message);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    renameProjectHandler();
}

module.exports = { renameProject };