import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './ProjectList.css';
import { useTranslation } from 'react-i18next';
import { 
  selectFilteredProjects, 
  deleteProject, 
  setSortBy,
  selectProjectsSortBy 
} from '../store/slices/projectsSlice';
import ProjectForm from './ProjectForm';

const ProjectList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const projects = useSelector(selectFilteredProjects);
  const sortBy = useSelector(selectProjectsSortBy);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleDelete = (projectId) => {
    if (window.confirm(t('confirmDelete'))) {
      dispatch(deleteProject(projectId));
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSortChange = (value) => {
    dispatch(setSortBy(value));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="project-list">
      <div className="list-header">
        <h2>{t('projects')}</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
        >
          {t('createProject')}
        </button>
      </div>

      <div className="filters-sort">
        <div className="sort-group">
          <label>{t('sort')}:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="createdAt">{t('sortByDate')}</option>
            <option value="title">{t('sortByTitle')}</option>
          </select>
        </div>
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p>{t('noProjects')}</p>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="card-header">
                <h3>{project.title}</h3>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-meta">
                <span className="date">
                  {t('dateCreated')}: {formatDate(project.createdAt)}
                </span>
              </div>
              <div className="project-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEdit(project)}
                >
                  {t('edit')}
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(project.id)}
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectList;