const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const INDEX_FILE = path.join(__dirname, '../../data/project_index.json');

async function searchProjects(criteria, value) {
    try {
        const data = await fs.readFile(INDEX_FILE, 'utf8');
        const projects = JSON.parse(data);
        
        const results = projects.filter(project => {
            const fieldValue = project[criteria]?.toString().toLowerCase();
            return fieldValue && fieldValue.includes(value.toLowerCase());
        });
        
        return results;
    } catch (error) {
        throw error;
    }
}

async function interactiveSearch() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const criteria = await new Promise((resolve) => {
            rl.question('Введите критерий поиска (name, manager, status): ', resolve);
        });

        if (!['name', 'manager', 'status'].includes(criteria)) {
            console.log('Недопустимый критерий поиска. Используйте: name, manager, status');
            rl.close();
            return;
        }

        const value = await new Promise((resolve) => {
            rl.question(`Введите значение для поиска по ${criteria}: `, resolve);
        });

        const results = await searchProjects(criteria, value);
        
        if (results.length === 0) {
            console.log(' Проекты не найдены');
        } else {
            console.log(`Найдено проектов: ${results.length}`);
            console.log('───────────────────────');
            
            results.forEach((project, index) => {
                console.log(`${index + 1}. ${project.name}`);
                console.log(`   ID: ${project.id}`);
                console.log(`   Менеджер: ${project.manager}`);
                console.log(`   Статус: ${project.status}`);
                console.log('───────────────────────');
            });
        }
        
    } catch (error) {
        console.error('Ошибка при поиске:', error.message);
    } finally {
        rl.close();
    }
}

if (require.main === module) {
    interactiveSearch();
}

module.exports = { searchProjects };