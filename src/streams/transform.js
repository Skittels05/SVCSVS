const { Transform } = require('stream');

class ProjectTransformer extends Transform {
    constructor(options = {}) {
        super({ ...options, objectMode: true });
    }

    _transform(chunk, encoding, callback) {
        try {
            const project = JSON.parse(chunk.toString());
            const transformedProject = {
                projectId: project.id,
                projectName: project.name,
                projectManager: project.manager,
                projectStatus: project.status.toUpperCase(),
                metadata: {
                    description: project.description,
                    created: project.createdAt,
                    updated: project.updatedAt
                }
            };
            
            this.push(JSON.stringify(transformedProject) + '\n');
            callback();
            
        } catch (err) {
            callback(err);
        }
    }
}

function transformProjects() {
    const transformer = new ProjectTransformer();
    
    console.log('Преобразование проектов...');
    console.log('Введите проекты в формате JSON (Ctrl+D для завершения):');
    
    process.stdin
        .pipe(transformer)
        .pipe(process.stdout);
    
    transformer.on('error', (err) => {
        console.error('Ошибка преобразования:', err.message);
    });
}

transformProjects();