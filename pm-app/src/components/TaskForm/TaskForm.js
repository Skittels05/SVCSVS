import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addTask, updateTask, selectTasksError, clearTaskError } from '../store/slices/tasksSlice';
import { selectAllProjects } from '../store/slices/projectsSlice';
import { selectAllMembers } from '../store/slices/membersSlice';
import './TaskForm.css';

const TaskForm = ({ task, onCancel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const error = useSelector(selectTasksError);
  const projects = useSelector(selectAllProjects);
  const members = useSelector(selectAllMembers);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'pending',
    priority: 'medium',
    assignee: '',
    dueDate: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task]);

  useEffect(() => {
    dispatch(clearTaskError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : '',
    };
    
    if (task) {
      dispatch(updateTask({ id: task.id, updates: taskData }));
    } else {
      dispatch(addTask(taskData));
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
    <form onSubmit={handleSubmit} className="task-form">
      <h3>{task ? t('edit') : t('createTask')}</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">{t('title')}: *</label>
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
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="projectId">{t('projects')}: *</label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
        >
          <option value="">{t('selectProject')}</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">{t('status')}:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending">{t('pending')}</option>
            <option value="in-progress">{t('in-progress')}</option>
            <option value="completed">{t('completed')}</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="priority">{t('priority')}:</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="assignee">{t('assignee')}:</label>
          <select
            id="assignee"
            name="assignee"
            value={formData.assignee}
            onChange={handleChange}
          >
            <option value="">{t('selectAssignee')}</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">{t('dueDate')}:</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn-primary">{t('save')}</button>
        <button type="button" onClick={onCancel}>{t('cancel')}</button>
      </div>
    </form>
  );
};

export default TaskForm;