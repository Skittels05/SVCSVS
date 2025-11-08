import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import './ProjectForm.css';
import { addProject, updateProject, selectProjectsError, clearError } from '../store/slices/projectsSlice';

const ProjectForm = ({ project, onCancel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const error = useSelector(selectProjectsError);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (project) {
      setFormData(project);
    }
  }, [project]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (project) {
      dispatch(updateProject({ id: project.id, updates: formData }));
    } else {
      dispatch(addProject(formData));
    }
    
    if (!error) {
      onCancel();
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <h3>{project ? t('edit') : t('createProject')}</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">{t('title')}:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">{t('description')}:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-actions">
        <button type="submit">{t('save')}</button>
        <button type="button" onClick={onCancel}>{t('cancel')}</button>
      </div>
    </form>
  );
};

export default ProjectForm;