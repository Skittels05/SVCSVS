import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadAttachments,
  deleteAttachment,
} from '../../store/slices/tasksSlice';
import Modal from '../../components/Modal/Modal';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SortingControls from '../../components/SortingControls/SortingControls';
import api from '../../services/api';
import { handleApiError } from '../../utils/handleApiError';
import './TasksPage.css';

const TasksPage = () => {
  const dispatch = useDispatch();
  const { list: tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [modalTask, setModalTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    story_points: '',
    due_date: '',
    project_id: '',
    iteration_id: '',
    assignee_id: '',
    reporter_id: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [projects, setProjects] = useState([]);
  const [iterations, setIterations] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingIterations, setLoadingIterations] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await api.get('/projects?limit=1000');
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      const loadIterations = async () => {
        setLoadingIterations(true);
        try {
          const response = await api.get(`/iterations?project_id=${formData.project_id}&limit=100`);
          setIterations(response.data.data || []);
        } catch (err) {
          console.error('Ошибка загрузки итераций:', err);
          setIterations([]);
        } finally {
          setLoadingIterations(false);
        }
      };
      loadIterations();
    } else {
      setIterations([]);
    }
  }, [formData.project_id]);

  useEffect(() => {
    if (formData.project_id) {
      const loadMembers = async () => {
        setLoadingMembers(true);
        try {
          const response = await api.get(`/projects/${formData.project_id}/members`);
          setProjectMembers(response.data || []);
        } catch (err) {
          console.error('Ошибка загрузки участников:', err);
          setProjectMembers([]);
        } finally {
          setLoadingMembers(false);
        }
      };
      loadMembers();
    } else {
      setProjectMembers([]);
    }
  }, [formData.project_id]);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit,
      sort: `${sortField}:${sortDirection}`,
    };
    if (filterProject) params.projectId = filterProject;
    if (filterStatus) params.status = filterStatus;

    dispatch(fetchTasks(params))
      .unwrap()
      .then((payload) => {
        setTotalTasks(payload.total || 0);
        setTotalPages(payload.pages || 1);
      });
  }, [dispatch, currentPage, sortField, sortDirection, filterProject, filterStatus]);

  const canEditOrDeleteTask = (task) => {
    if (!currentUser) return false;
    if (currentUser.rights === 'admin') return true;

    const reporterId = task?.Reporter?.id ?? null;
    const assigneeId = task?.Assignee?.id ?? null;
    const projectCreatorId = task?.Project?.Creator?.id ?? null;

    return (
      reporterId === currentUser.id ||
      assigneeId === currentUser.id ||
      projectCreatorId === currentUser.id
    );
  };

  const canDeleteAttachment = (attachment) => {
    if (!currentUser) return false;
    if (currentUser.rights === 'admin') return true;
    return attachment?.Uploader?.id === currentUser.id;
  };

  const openTaskModal = (task = null, edit = false) => {
    if (task && edit && !canEditOrDeleteTask(task)) {
      alert('У вас нет прав на редактирование этой задачи');
      return;
    }
    setModalTask(task);
    setIsEditMode(edit || !task);
    setFormData(task ? {
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      story_points: task.story_points?.toString() || '',
      due_date: task.due_date || '',
      project_id: task.project_id?.toString() || '',
      iteration_id: task.iteration_id?.toString() || '',
      assignee_id: task.assignee_id?.toString() || '',
      reporter_id: task.reporter_id?.toString() || '',
    } : {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      story_points: '',
      due_date: '',
      project_id: '',
      iteration_id: '',
      assignee_id: '',
      reporter_id: '',
    });
    setSelectedFiles([]);
    setFormErrors({});
    setServerError('');
  };

  const closeModal = () => {
    setModalTask(null);
    setIsEditMode(false);
    setIterations([]);
    setProjectMembers([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert('Максимум 10 изображений');
      return;
    }
    setSelectedFiles(files);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Заголовок обязателен';
    if (!formData.project_id) errors.project_id = 'Выберите проект';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setServerError('');
    setFormErrors({});

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: formData.status,
      story_points: formData.story_points ? parseInt(formData.story_points) : null,
      due_date: formData.due_date || null,
      project_id: parseInt(formData.project_id),
      iteration_id: formData.iteration_id ? parseInt(formData.iteration_id) : null,
      assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
      reporter_id: formData.reporter_id ? parseInt(formData.reporter_id) : null,
    };

    try {
      let newTask;
      if (modalTask) {
        if (!canEditOrDeleteTask(modalTask)) {
          setServerError('У вас нет прав на редактирование этой задачи');
          return;
        }
        await dispatch(updateTask({ id: modalTask.id, taskData })).unwrap();
        newTask = { ...modalTask, ...taskData };
      } else {
        const result = await dispatch(createTask(taskData)).unwrap();
        newTask = result;
      }

      if (selectedFiles.length > 0) {
        await dispatch(uploadAttachments({
          taskId: newTask.id,
          files: selectedFiles,
          userId: currentUser.id,
        }));
      }

      closeModal();
    } catch (err) {
      handleApiError(err, setFormErrors, setServerError);
    }
  };

  const handleDelete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!canEditOrDeleteTask(task)) {
      alert('У вас нет прав на удаление этой задачи');
      return;
    }
    if (window.confirm('Удалить задачу? Все вложения будут удалены безвозвратно.')) {
      dispatch(deleteTask(id));
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    const attachment = modalTask?.Attachments?.find(a => a.id === attachmentId);
    if (!canDeleteAttachment(attachment)) {
      alert('У вас нет прав на удаление этого вложения');
      return;
    }
    if (window.confirm('Удалить изображение?')) {
      dispatch(deleteAttachment({ attachmentId, taskId: modalTask.id }));
      setModalTask(prev => ({
        ...prev,
        Attachments: prev.Attachments.filter(a => a.id !== attachmentId),
      }));
    }
  };

  const tableColumns = [
    { key: 'title', header: 'Название', render: (t) => <strong>{t.title}</strong> },
    { key: 'Project', header: 'Проект', render: (t) => t.Project?.name || '—' },
    { key: 'Iteration', header: 'Итерация', render: (t) => t.Iteration?.name || '—' },
    {
      key: 'priority',
      header: 'Приоритет',
      render: (t) => <span className={`priority-tag priority-${t.priority}`}>{t.priority}</span>
    },
    {
      key: 'status',
      header: 'Статус',
      render: (t) => <span className={`status-tag status-${t.status}`}>{t.status}</span>
    },
    { key: 'Assignee', header: 'Исполнитель', render: (t) => t.Assignee?.full_name || '—' },
  ];

  const sortingFields = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Название' },
    { key: 'priority', label: 'Приоритет' },
    { key: 'status', label: 'Статус' },
    { key: 'Project.name', label: 'Проект' },
    { key: 'Iteration.name', label: 'Итерация' },
  ];

  const additionalFilters = () => (
    <div className="filter-group">
      <div className="filter-item">
        <label>Проект:</label>
        <select value={filterProject} onChange={(e) => { setFilterProject(e.target.value); setCurrentPage(1); }}>
          <option value="">Все проекты</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="filter-item">
        <label>Статус:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
          <option value="">Все статусы</option>
          <option value="backlog">Бэклог</option>
          <option value="todo">To Do</option>
          <option value="in_progress">В работе</option>
          <option value="review">На проверке</option>
          <option value="done">Готово</option>
        </select>
      </div>
    </div>
  );

  const resetFilters = () => {
    setFilterProject('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const customActions = (task) => {
    const canManage = canEditOrDeleteTask(task);

    return (
      <div className="table-actions">
        <button
          onClick={() => openTaskModal(task, false)}
          className="btn btn-info btn-small"
        >
          Просмотр
        </button>

        <button
          onClick={() => openTaskModal(task, true)}
          className="btn btn-primary btn-small"
          disabled={!canManage}
          title={!canManage ? 'Нет прав на редактирование' : ''}
        >
          Редактировать
        </button>

        <button
          onClick={() => handleDelete(task.id)}
          className="btn btn-danger btn-small"
          disabled={!canManage}
          title={!canManage ? 'Нет прав на удаление' : ''}
        >
          Удалить
        </button>
      </div>
    );
  };

  if (tasksLoading && currentPage === 1) {
    return <div className="page-loading">Загрузка задач...</div>;
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h2>Задачи</h2>
        <button onClick={() => openTaskModal()} className="btn btn-success btn-add">
          + Добавить задачу
        </button>
      </div>

      <SortingControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
        availableFields={sortingFields}
        onResetFilters={resetFilters}
        additionalControls={additionalFilters}
        title="Фильтры и сортировка"
      />

      <DataTable
        data={tasks}
        columns={tableColumns}
        emptyMessage="Задач не найдено"
        customActions={customActions}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalTasks}
        pageSize={limit}
        onPageChange={setCurrentPage}
        loading={tasksLoading}
      />

      <Modal
        isOpen={modalTask !== null}
        onClose={closeModal}
        title={isEditMode ? (modalTask ? 'Редактировать задачу' : 'Создать задачу') : 'Просмотр задачи'}
      >
        <div className="task-modal-content">
          {isEditMode ? (
            <form onSubmit={handleSubmit} className="task-form">
              {serverError && <div className="error-message">{serverError}</div>}

              <div className="form-group">
                <label>Заголовок *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  placeholder="Краткое название задачи"
                />
                {formErrors.title && <span className="error-text">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  rows="5"
                  placeholder="Подробное описание"
                />
              </div>

              <div className="form-group">
                <label>Проект *</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value, iteration_id: '', assignee_id: '', reporter_id: '' })}
                  className="form-select"
                  disabled={loadingProjects}
                >
                  <option value="">Выберите проект</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {formErrors.project_id && <span className="error-text">{formErrors.project_id}</span>}
              </div>

              <div className="form-group">
                <label>Итерация</label>
                <select
                  value={formData.iteration_id}
                  onChange={(e) => setFormData({ ...formData, iteration_id: e.target.value })}
                  className="form-select large-select"
                  disabled={!formData.project_id}
                >
                  <option value="">— Без итерации —</option>
                  {iterations.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.type})</option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Исполнитель</label>
                  <select
                    value={formData.assignee_id}
                    onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                    className="form-select large-select"
                    disabled={!formData.project_id}
                  >
                    <option value="">— Не назначен —</option>
                    {projectMembers.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Репортер</label>
                  <select
                    value={formData.reporter_id}
                    onChange={(e) => setFormData({ ...formData, reporter_id: e.target.value })}
                    className="form-select large-select"
                    disabled={!formData.project_id}
                  >
                    <option value="">— Не назначен —</option>
                    {projectMembers.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Приоритет</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="form-select">
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="critical">Критический</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Статус</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="form-select">
                    <option value="backlog">Бэклог</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">В работе</option>
                    <option value="review">На проверке</option>
                    <option value="done">Готово</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={formData.story_points}
                    onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Срок выполнения</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {modalTask?.Attachments?.length > 0 && (
                <div className="attachments-section">
                  <h4>Текущие вложения ({modalTask.Attachments.length})</h4>
                  <div className="attachments-grid">
                    {modalTask.Attachments.map(att => (
                      <div key={att.id} className="attachment-item">
                        <img src={`http://localhost:5000${att.file_url}`} alt={att.file_name} />
                        <p>{att.file_name}</p>
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="btn btn-danger btn-small"
                          disabled={!canDeleteAttachment(att)}
                          title={!canDeleteAttachment(att) ? 'Нет прав на удаление' : ''}
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Добавить изображения (до 10)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="form-file-input" />
                {selectedFiles.length > 0 && <p className="file-info">Выбрано: {selectedFiles.length} файлов</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-submit">
                {modalTask ? 'Сохранить изменения' : 'Создать задачу'}
              </button>
            </form>
          ) : (
            <div className="task-view">
              <h3>{modalTask?.title}</h3>
              <div className="task-details">
                <p><strong>Описание:</strong> {modalTask?.description || '—'}</p>
                <p><strong>Проект:</strong> {modalTask?.Project?.name || '—'}</p>
                <p><strong>Итерация:</strong> {modalTask?.Iteration?.name || '—'}</p>
                <p><strong>Приоритет:</strong> <span className={`priority-tag priority-${modalTask?.priority}`}>{modalTask?.priority}</span></p>
                <p><strong>Статус:</strong> <span className={`status-tag status-${modalTask?.status}`}>{modalTask?.status}</span></p>
                <p><strong>Story Points:</strong> {modalTask?.story_points || '—'}</p>
                <p><strong>Срок:</strong> {modalTask?.due_date || '—'}</p>
                <p><strong>Исполнитель:</strong> {modalTask?.Assignee?.full_name || '—'}</p>
                <p><strong>Репортер:</strong> {modalTask?.Reporter?.full_name || '—'}</p>
              </div>

              {modalTask?.Attachments?.length > 0 && (
                <div className="attachments-section view-mode">
                  <h4>Вложения ({modalTask.Attachments.length})</h4>
                  <div className="attachments-grid">
                    {modalTask.Attachments.map(att => (
                      <div key={att.id} className="attachment-item view">
                        <img src={`http://localhost:5000${att.file_url}`} alt={att.file_name} />
                        <p>{att.file_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsEditMode(true)}
                className="btn btn-primary"
                disabled={!canEditOrDeleteTask(modalTask)}
                title={!canEditOrDeleteTask(modalTask) ? 'Нет прав на редактирование' : ''}
              >
                Редактировать задачу
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TasksPage;