const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

const PROJECTS_FILE = 'projects.json';

async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { projects: [] };
        }
        throw error;
    }
}

async function writeJsonFile(filename, data) {
    await fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/projects', async (req, res) => {
    try {
        const data = await readJsonFile(PROJECTS_FILE);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read projects data' });
    }
});

app.get('/api/projects/export', async (req, res) => {
    try {
        const data = await readJsonFile(PROJECTS_FILE);
        const acceptHeader = req.headers.accept || 'application/json';
        
        if (acceptHeader.includes('text/html')) {
            let html = '<!DOCTYPE html><html><head><title>Projects Export</title>';
            html += '<style>table {border-collapse: collapse; width: 100%;} th, td {border: 1px solid #ddd; padding: 8px;} th {background-color: #f2f2f2;}</style>';
            html += '</head><body><h1>Projects List</h1>';
            html += `<p>Total projects: ${data.projects.length}</p>`;
            html += '<table><tr><th>ID</th><th>Title</th><th>Description</th><th>Status</th><th>Created At</th></tr>';
            
            data.projects.forEach(project => {
                html += `<tr>
                    <td>${project.id}</td>
                    <td>${project.title}</td>
                    <td>${project.description}</td>
                    <td>${project.status}</td>
                    <td>${new Date(project.createdAt).toLocaleDateString()}</td>
                </tr>`;
            });
            
            html += '</table></body></html>';
            res.header('Content-Type', 'text/html');
            res.send(html);
            
        } else {
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to export data' });
    }
});

app.get('/download/:format', async (req, res) => {
    try {
        const format = req.params.format.toLowerCase();
        const data = await readJsonFile(PROJECTS_FILE);
        
        if (format === 'json') {
            const jsonString = JSON.stringify(data, null, 2);
            res.header('Content-Type', 'application/json');
            res.header('Content-Disposition', 'attachment; filename="projects.json"');
            res.send(jsonString);
            
        } else if (format === 'html') {
            let html = '<!DOCTYPE html><html><head><title>Projects Export</title>';
            html += '<style>table {border-collapse: collapse; width: 100%;} th, td {border: 1px solid #ddd; padding: 8px;} th {background-color: #f2f2f2;}</style>';
            html += '</head><body><h1>Projects List</h1>';
            html += `<p>Total projects: ${data.projects.length}</p>`;
            html += '<table><tr><th>ID</th><th>Title</th><th>Description</th><th>Status</th><th>Created At</th></tr>';
            
            data.projects.forEach(project => {
                html += `<tr>
                    <td>${project.id}</td>
                    <td>${project.title}</td>
                    <td>${project.description}</td>
                    <td>${project.status}</td>
                    <td>${new Date(project.createdAt).toLocaleDateString()}</td>
                </tr>`;
            });
            
            html += '</table></body></html>';
            res.header('Content-Type', 'text/html');
            res.header('Content-Disposition', 'attachment; filename="projects.html"');
            res.send(html);
            
        } else {
            res.status(400).json({ error: 'Invalid format. Use json or html' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate download file' });
    }
});

app.post('/api/projects/summary', async (req, res) => {
    try {
        const data = await readJsonFile(PROJECTS_FILE);
        const summary = {
            totalProjects: data.projects.length,
            activeProjects: data.projects.filter(p => p.status === 'active').length,
            completedProjects: data.projects.filter(p => p.status === 'completed').length
        };
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const newProject = req.body;
        
        if (!newProject.title || !newProject.description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const data = await readJsonFile(PROJECTS_FILE);
        newProject.id = Date.now();
        newProject.createdAt = new Date().toISOString();
        newProject.status = newProject.status || 'active';
        
        data.projects.push(newProject);
        await writeJsonFile(PROJECTS_FILE, data);
        
        res.json({ success: true, project: newProject });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add project' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const data = await readJsonFile(PROJECTS_FILE);
        
        const initialLength = data.projects.length;
        data.projects = data.projects.filter(project => project.id !== projectId);
        
        if (data.projects.length === initialLength) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        await writeJsonFile(PROJECTS_FILE, data);
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});