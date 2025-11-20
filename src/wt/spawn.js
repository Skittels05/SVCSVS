const { spawn } = require('child_process');
const path = require('path');

function spawnSearchProcess(searchTerm) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [
            path.join(__dirname, 'search_worker.js'),
            searchTerm
        ]);

        let results = '';
        let errors = '';

        child.stdout.on('data', (data) => {
            results += data.toString();
        });

        child.stderr.on('data', (data) => {
            errors += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                try {
                    const parsedResults = JSON.parse(results);
                    resolve(parsedResults);
                } catch (parseError) {
                    resolve({ message: results });
                }
            } else {
                reject(new Error(`Процесс завершился с кодом ${code}: ${errors}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function fullTextSearch() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Использование: node src/wt/spawn.js <поисковый_запрос>');
        process.exit(1);
    }

    const searchTerm = args[0];
    
    console.log(`Запуск полнотекстового поиска: "${searchTerm}"`);
    console.log('Обработка...');

    try {
        const startTime = Date.now();
        const results = await spawnSearchProcess(searchTerm);
        const endTime = Date.now();

        if (results.length === 0) {
            console.log('Проекты не найдены');
        } else {
            console.log(`Найдено проектов: ${results.length}`);
            console.log(`Время выполнения: ${endTime - startTime}ms`);
            console.log('───────────────────────');
            
            results.forEach((project, index) => {
                console.log(`${index + 1}. ${project.name}`);
                console.log(`   ID: ${project.id}`);
                console.log(`   Менеджер: ${project.manager}`);
                console.log(`   Статус: ${project.status}`);
                console.log(`   Совпадение: ${project.matchedField}`);
                console.log('───────────────────────');
            });
        }
        
    } catch (error) {
        console.error('Ошибка при поиске:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    fullTextSearch();
}

module.exports = { spawnSearchProcess };