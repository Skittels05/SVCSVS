import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './TaskList.css';
import { useTranslation } from 'react-i18next';
import { 
  selectFilteredTasks, 
  deleteTask, 
  toggleTaskCompletion,
  setTaskFilters,
  setTaskSortBy,
  selectTasksFilters,
  selectTasksSortBy 
} from '../store/slices/tasksSlice';
import { selectAllProjects } from '../store/slices/projectsSlice';
import { selectAllMembers } from '../store/slices/membersSlice';
import TaskForm from './TaskForm';

const TaskList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tasks = useSelector(selectFilteredTasks);
  const projects = useSelector(selectAllProjects);
  const members = useSelector(selectAllMembers);
  const filters = useSelector(selectTasksFilters);
  const sortBy = useSelector(selectTasksSortBy);
  
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleDelete = (taskId) => {
    if (window.confirm(t('confirmDelete'))) {
      dispatch(deleteTask(taskId));
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleToggleCompletion = (taskId) => {
    dispatch(toggleTaskCompletion(taskId));
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setTaskFilters({ [filterType]: value }));
  };

  const handleSortChange = (value) => {
    dispatch(setTaskSortBy(value));
  };

  const getProjectTitle = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : t('unknownProject');
  };

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return t('notAssigned');
    const member = members.find(m => m.id === assigneeId);
    return member ? `${member.name} (${member.role})` : t('unknownMember');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('noDate');
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !filters.status === 'completed';
  };

  return (
    <div className="task-list">
      <div className="list-header">
        <h2>{t('tasks')}</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          {t('createTask')}
        </button>
      </div>

      <div className="filters-sort">
        <div className="filter-group">
          <label>{t('filter')}:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">{t('all')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in-progress">{t('in-progress')}</option>
            <option value="completed">{t('completed')}</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">{t('all')}</option>
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
          </select>
          
          <select
            value={filters.projectId}
            onChange={(e) => handleFilterChange('projectId', e.target.value)}
          >
            <option value="all">{t('all')} {t('projects')}</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        
        <div className="sort-group">
          <label>{t('sort')}:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="dueDate">{t('dueDate')}</option>
            <option value="title">{t('sortByTitle')}</option>
            <option value="priority">{t('sortByPriority')}</option>
          </select>
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <p>{t('noTasks')}</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-card ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
              <div className="card-header">
                <h3>{task.title}</h3>
                <span className={`priority-badge ${task.priority}`}>
                  {t(task.priority)}
                </span>
              </div>
              
              <p className="task-description">{task.description}</p>
              
              <div className="meta-info">
                <div className="meta-item">
                  <strong>{t('projects')}:</strong> 
                  <span>{getProjectTitle(task.projectId)}</span>
                </div>
                
                <div className="meta-item">
                  <strong>{t('assignee')}:</strong> 
                  <span>{getAssigneeName(task.assignee)}</span>
                </div>
                
                {task.dueDate && (
                  <div className="meta-item">
                    <strong>{t('dueDate')}:</strong> 
                    <span className={isOverdue(task.dueDate) ? 'overdue-text' : ''}>
                      {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) && ' ⚠️'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="task-footer">
                <span className={`status ${task.status}`}>
                  {t(task.status)}
                </span>
                
                <div className="task-actions">
                  <button 
                    className={`btn-complete ${task.completed ? 'completed' : ''}`}
                    onClick={() => handleToggleCompletion(task.id)}
                  >
                    {task.completed ? '✓' : t('complete')}
                  </button>
                  
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(task)}
                  >
                    {t('edit')}
                  </button>
                  
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(task.id)}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;