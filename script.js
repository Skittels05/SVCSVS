const API_BASE = 'http://localhost:3000/api';

async function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = 'Loading projects...';

    try {
        const response = await fetch(`${API_BASE}/projects`);
        const data = await response.json();

        if (data.projects && data.projects.length > 0) {
            let html = '';
            data.projects.forEach(project => {
                html += `
                            <div class="project-item">
                                <h3>${project.title}</h3>
                                <p>${project.description}</p>
                                <p>ID: ${project.id} | Status: 
                                    <span class="status-${project.status}">${project.status}</span>
                                </p>
                            </div>
                        `;
            });
            projectsList.innerHTML = html;
        } else {
            projectsList.innerHTML = '<p>No projects found.</p>';
        }
    } catch (error) {
        projectsList.innerHTML = 'Error loading projects';
        console.error('Error:', error);
    }
}

async function getProjectSummary() {
    try {
        const response = await fetch(`${API_BASE}/projects/summary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const summary = await response.json();
        alert(`Total: ${summary.totalProjects}\nActive: ${summary.activeProjects}\nCompleted: ${summary.completedProjects}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function addProject() {
    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDescription').value;
    const status = document.getElementById('projectStatus').value;
    const resultDiv = document.getElementById('addProjectResult');

    if (!title || !description) {
        resultDiv.innerHTML = 'Title and description are required';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, status })
        });

        const result = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = 'Project added successfully!';
            document.getElementById('projectTitle').value = '';
            document.getElementById('projectDescription').value = '';
            loadProjects();
        } else {
            resultDiv.innerHTML = `Error: ${result.error}`;
        }
    } catch (error) {
        resultDiv.innerHTML = 'Error adding project';
        console.error('Error:', error);
    }
}
async function exportData(format) {
    const resultDiv = document.getElementById('exportResult');
    resultDiv.innerHTML = 'Exporting data...';

    try {
        const headers = {};
        if (format === 'html') {
            headers['Accept'] = 'text/html';
        } else {
            headers['Accept'] = 'application/json';
        }

        const response = await fetch(`${API_BASE}/projects/export`, { headers });

        if (format === 'json') {
            const data = await response.json();
            resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } else if (format === 'html') {
            const html = await response.text();
            resultDiv.innerHTML = `<div>${html}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = 'Error exporting data';
        console.error('Error:', error);
    }
}

function downloadFile(format) {
    window.open(`http://localhost:3000/download/${format}`, '_blank');
}
async function deleteProject() {
    const projectId = document.getElementById('deleteProjectId').value;
    const resultDiv = document.getElementById('deleteResult');

    if (!projectId) {
        resultDiv.innerHTML = 'Please enter project ID';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = 'Project deleted successfully!';
            document.getElementById('deleteProjectId').value = '';
            loadProjects();
        } else {
            resultDiv.innerHTML = `Error: ${result.error}`;
        }
    } catch (error) {
        resultDiv.innerHTML = 'Error deleting project';
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadProjects);