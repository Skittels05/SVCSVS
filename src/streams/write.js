const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

async function writeProjects() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Использование: node src/streams/write.js <выходной_файл>');
        console.log('Затем введите проекты в формате JSON (по одному в строке)');
        console.log('Для завершения ввода: Ctrl+D → Enter');
        process.exit(1);
    }

    const filename = args[0];
    const projects = [];
    
    console.log('Введите проекты в формате JSON (по одному в строке):');
    console.log('Для завершения ввода: Ctrl+D → Enter');
    console.log('───────────────────────');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        for await (const line of rl) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                try {
                    const project = JSON.parse(trimmedLine);
                    projects.push(project);
                    console.log(`Добавлен проект: ${project.name}`);
                } catch (parseError) {
                    console.log('Ошибка парсинга JSON, строка пропущена');
                }
            }
        }

        if (projects.length === 0) {
            console.log('Нет данных для записи');
            return;
        }

        await fs.writeFile(filename, JSON.stringify(projects, null, 2));
        console.log(`Все проекты (${projects.length}) сохранены в: ${filename}`);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

if (require.main === module) {
    writeProjects();
}

module.exports = { writeProjects };