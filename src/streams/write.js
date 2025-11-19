const fs = require('fs');
const path = require('path');
const { Writable } = require('stream');

class ProjectWriter extends Writable {
    constructor(filename, options = {}) {
        super(options);
        this.filename = filename;
        this.projects = [];
    }

    _write(chunk, encoding, callback) {
        try {
            const project = JSON.parse(chunk.toString());
            this.projects.push(project);
            console.log(`Записан проект: ${project.name}`);
            callback();
        } catch (err) {
            callback(err);
        }
    }

    _final(callback) {
        fs.writeFile(this.filename, JSON.stringify(this.projects, null, 2), (err) => {
            if (err) return callback(err);
            console.log(`✅ Все проекты сохранены в: ${this.filename}`);
            callback();
        });
    }
}

function writeProjects() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Использование: node src/streams/write.js <выходной_файл>');
        console.log('Затем введите проекты в формате JSON (по одному в строке)');
        process.exit(1);
    }

    const filename = args[0];
    const writer = new ProjectWriter(filename);
    
    console.log('Введите проекты в формате JSON (Ctrl+D для завершения):');
    
    process.stdin.pipe(writer);
    
    writer.on('finish', () => {
        console.log('Запись завершена');
    });
    
    writer.on('error', (err) => {
        console.error('Ошибка записи:', err.message);
    });
}

writeProjects();