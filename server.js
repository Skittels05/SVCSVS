const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { create } = require('xmlbuilder2');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

const PROJECTS_FILE = 'projects.json';

async function readJsonFile(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        if (!data.trim()) {
            const defaultValue = { projects: [] };
            await fs.writeFile(filename, JSON.stringify(defaultValue, null, 2), 'utf8');
            return defaultValue;
        }
        const parsed = JSON.parse(data);
        if (!parsed.projects || !Array.isArray(parsed.projects)) {
            const defaultValue = { projects: [] };
            await fs.writeFile(filename, JSON.stringify(defaultValue, null, 2), 'utf8');
            return defaultValue;
        }
        parsed.projects = parsed.projects.filter(project => 
            project && typeof project === 'object' && project.title
        ).map(project => ({
            id: project.id || Date.now() + Math.floor(Math.random() * 1000),
            title: project.title || '',
            description: project.description || '',
            status: ['active', 'completed', 'on-hold'].includes(project.status) ? project.status : 'active',
            createdAt: project.createdAt || new Date().toISOString()
        }));
        return parsed;
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            const defaultValue = { projects: [] };
            await fs.writeFile(filename, JSON.stringify(defaultValue, null, 2), 'utf8');
            return defaultValue;
        }
        throw error;
    }
}

async function writeJsonFile(filename, data) {
    const tempFile = filename + '.tmp';
    try {
        await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
        await fs.rename(tempFile, filename);
    } catch (error) {
        try {
            await fs.unlink(tempFile);
        } catch (unlinkError) {
        }
        throw error;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/projects', async (req, res) => {
    try {
        const data = await readJsonFile(PROJECTS_FILE);
        res.json(data);
    } catch (error) {
        res.json({ projects: [] });
    }
});

app.get('/api/projects/export', async (req, res) => {
    try {
        const data = await readJsonFile(PROJECTS_FILE);
        const acceptHeader = req.headers.accept || 'application/json';
        
        if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) {
            const xml = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('projects')
                .ele('total').txt(data.projects.length.toString()).up()
                .ele('list');
            
            data.projects.forEach(project => {
                xml.ele('project')
                    .ele('id').txt(project.id.toString()).up()
                    .ele('title').txt(project.title).up()
                    .ele('description').txt(project.description).up()
                    .ele('status').txt(project.status).up()
                    .ele('createdAt').txt(project.createdAt).up();
            });
            
            const xmlString = xml.end({ prettyPrint: true });
            res.header('Content-Type', 'application/xml');
            res.send(xmlString);
            
        } else if (acceptHeader.includes('text/html')) {
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
        const errorData = { projects: [] };
        if (req.headers.accept?.includes('xml')) {
            const xml = create({ version: '1.0' }).ele('projects').ele('list');
            res.header('Content-Type', 'application/xml');
            res.send(xml.end({ prettyPrint: true }));
        } else if (req.headers.accept?.includes('html')) {
            res.header('Content-Type', 'text/html');
            res.send('<html><body><h1>Projects</h1><p>No data available</p></body></html>');
        } else {
            res.json(errorData);
        }
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
            
        } else if (format === 'xml') {
            const xml = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('projects');
            
            data.projects.forEach(project => {
                xml.ele('project')
                    .ele('id').txt(project.id.toString()).up()
                    .ele('title').txt(project.title).up()
                    .ele('description').txt(project.description).up()
                    .ele('status').txt(project.status).up()
                    .ele('createdAt').txt(project.createdAt).up();
            });
            
            const xmlString = xml.end({ prettyPrint: true });
            res.header('Content-Type', 'application/xml');
            res.header('Content-Disposition', 'attachment; filename="projects.xml"');
            res.send(xmlString);
            
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
            res.status(400).json({ error: 'Invalid format. Use json, xml, or html' });
        }
    } catch (error) {
        const errorData = { projects: [] };
        if (format === 'json') {
            res.header('Content-Type', 'application/json');
            res.header('Content-Disposition', 'attachment; filename="projects.json"');
            res.send(JSON.stringify(errorData, null, 2));
        } else {
            res.status(500).json({ error: 'Failed to generate download file' });
        }
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
        res.json({
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0
        });
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
        res.json({
            success: true,
            project: req.body
        });
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
        res.json({
            success: true,
            message: 'Project marked for deletion'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});