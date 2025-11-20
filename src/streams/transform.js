const { Transform } = require('stream');
const readline = require('readline');

class ProjectTransformer extends Transform {
    constructor(options = {}) {
        super({ ...options, objectMode: true });
        this.format = options.format || 'extended';
    }

    _transform(chunk, encoding, callback) {
        try {
            const data = chunk.toString().trim();
            if (!data) {
                return callback();
            }

            const project = JSON.parse(data);
            let transformedProject;

            if (this.format === 'extended') {
                transformedProject = {
                    projectId: project.id,
                    projectName: project.name,
                    projectManager: project.manager,
                    projectStatus: project.status.toUpperCase(),
                    metadata: {
                        description: project.description,
                        created: project.createdAt ? new Date(project.createdAt).toLocaleDateString('ru-RU') : 'N/A',
                        updated: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('ru-RU') : 'N/A',
                        filename: project.filename || 'N/A'
                    }
                };
            } else if (this.format === 'minimal') {
                transformedProject = {
                    id: project.id,
                    name: project.name,
                    status: project.status,
                    manager: project.manager
                };
            } else {
                transformedProject = project;
            }
            
            this.push(JSON.stringify(transformedProject) + '\n');
            callback();
            
        } catch (err) {
            console.error('Ошибка преобразования:', err.message);
            callback();
        }
    }
}

function transformProjects() {
    const args = process.argv.slice(2);
    const format = args[0] || 'extended';
    
    console.log(`Преобразование проектов в формат: ${format}`);
    console.log('Введите проекты в формате JSON (по одному в строке):');
    console.log('Для завершения ввода: Ctrl+D → Enter');
    console.log('───────────────────────');

    const transformer = new ProjectTransformer({ format });
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (line) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            transformer.write(trimmedLine);
        }
    });

    rl.on('close', () => {
        transformer.end();
    });
    
    transformer.pipe(process.stdout);
    
    transformer.on('error', (err) => {
        console.error('Ошибка преобразования:', err.message);
    });
    
    transformer.on('end', () => {
        console.log('\nПреобразование завершено');
    });
}

if (require.main === module) {
    transformProjects();
}

module.exports = { ProjectTransformer };