const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

class ProjectReader extends Readable {
    constructor(filename, options = {}) {
        super(options);
        this.filename = filename;
        this.data = [];
    }

    _construct(callback) {
        fs.readFile(this.filename, 'utf8', (err, data) => {
            if (err) return callback(err);
            
            try {
                this.data = JSON.parse(data);
                callback();
            } catch (parseErr) {
                callback(parseErr);
            }
        });
    }

    _read(size) {
        if (this.data.length === 0) {
            this.push(null);
        } else {
            const project = this.data.shift();
            this.push(JSON.stringify(project) + '\n');
        }
    }
}

function streamProjects() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Использование: node src/streams/read.js <файл_индекса>');
        process.exit(1);
    }

    const filename = args[0];
    
    const reader = new ProjectReader(filename);
    
    reader.on('data', (chunk) => {
        console.log('Получен проект:', chunk.toString().trim());
    });
    
    reader.on('end', () => {
        console.log('Чтение завершено');
    });
    
    reader.on('error', (err) => {
        console.error('Ошибка чтения:', err.message);
    });
}

streamProjects();