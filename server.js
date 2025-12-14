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