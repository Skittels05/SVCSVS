const fs = require('fs').promises;
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../../data/projects');
const INDEX_FILE = path.join(__dirname, '../../data/project_index.json');

async function fullTextSearch(searchTerm) {
    try {
        const indexData = await fs.readFile(INDEX_FILE, 'utf8');
        const index = JSON.parse(indexData);
        const results = [];
        for (const project of index) {
            let matchedField = '';
            
            if (project.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                matchedField = 'название';
            } else if (project.manager.toLowerCase().includes(searchTerm.toLowerCase())) {
                matchedField = 'менеджер';
            } else if (project.status.toLowerCase().includes(searchTerm.toLowerCase())) {
                matchedField = 'статус';
            }

            if (matchedField) {
                results.push({
                    ...project,
                    matchedField
                });
                continue; 
            }

            try {
                const projectData = await fs.readFile(
                    path.join(PROJECTS_DIR, project.filename), 
                    'utf8'
                );
                const projectDetails = JSON.parse(projectData);
                
                if (projectDetails.description && 
                    projectDetails.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({
                        ...project,
                        matchedField: 'описание'
                    });
                }
            } catch (error) {
                console.error(`Ошибка чтения файла ${project.filename}:`, error.message);
            }
        }

        return results;
    } catch (error) {
        throw error;
    }
}

async function main() {
    const searchTerm = process.argv[2];
    
    if (!searchTerm) {
        process.stderr.write('Ошибка: Не указан поисковый запрос\n');
        process.exit(1);
    }

    try {
        const results = await fullTextSearch(searchTerm);
        process.stdout.write(JSON.stringify(results));
    } catch (error) {
        process.stderr.write(`Ошибка поиска: ${error.message}\n`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { fullTextSearch };