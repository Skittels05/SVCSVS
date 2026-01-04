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

const TasksPage = () => {
    const dispatch = useDispatch();
    const { list: tasks, loading: tasksLoading } = useSelector((state) => state.tasks);

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
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingIterations, setLoadingIterations] = useState(false);
    const [projectMembers, setProjectMembers] = useState([]);
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
                const response = await api.get('/projects');
                setProjects(response.data.data || []);
            } catch (err) {
                console.error('Ошибка загрузки проектов:', err);
                setProjects([]);
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
                    const response = await api.get(`/iterations?project_id=${formData.project_id}`);
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
                    setProjectMembers(response.data);
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
        dispatch(
            fetchTasks({
                page: currentPage,
                limit,
                sort: `${sortField}:${sortDirection}`,
                projectId: filterProject || undefined,
                status: filterStatus || undefined,
            })
        )
            .unwrap()
            .then((payload) => {
                setTotalTasks(payload.total || 0);
                setTotalPages(payload.pages || 1);
            });
    }, [dispatch, currentPage, sortField, sortDirection, filterProject, filterStatus]);

    const openTaskModal = (task = null, edit = false) => {
        setModalTask(task);
        setIsEditMode(edit || !task);
        setFormData(task ? {
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
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
        setSelectedFiles(Array.from(e.target.files));
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
            ...formData,
            story_points: formData.story_points ? parseInt(formData.story_points) : null,
            iteration_id: formData.iteration_id ? parseInt(formData.iteration_id) : null,
            assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
            reporter_id: formData.reporter_id ? parseInt(formData.reporter_id) : null,
        };

        const action = modalTask ? updateTask({ id: modalTask.id, taskData }) : createTask(taskData);

        const resultAction = await dispatch(action);

        if (resultAction.type.endsWith('/rejected')) {
            handleApiError(resultAction, setFormErrors, setServerError);
        } else {
            const newTask = resultAction.payload;

            if (selectedFiles.length > 0) {
                await dispatch(uploadAttachments({
                    taskId: newTask.id,
                    files: selectedFiles,
                    userId: 1,
                }));
            }

            closeModal();
            dispatch(fetchTasks({ page: currentPage, limit }));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Удалить задачу? Все вложения тоже будут удалены.')) {
            dispatch(deleteTask(id));
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (window.confirm('Удалить изображение?')) {
            const taskId = modalTask.id;
            const result = await dispatch(deleteAttachment({ attachmentId, taskId }));
            if (!result.type.endsWith('/rejected')) {
                setModalTask(prev => ({
                    ...prev,
                    Attachments: prev.Attachments.filter(att => att.id !== attachmentId),
                }));
            }
        }
    };

    // Обработчики сортировки и фильтров
    const handleSortFieldChange = (field) => {
        setSortField(field);
        setCurrentPage(1);
    };

    const handleSortDirectionChange = (direction) => {
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const handleFilterProjectChange = (projectId) => {
        setFilterProject(projectId);
        setCurrentPage(1);
    };

    const handleFilterStatusChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilterProject('');
        setFilterStatus('');
        setCurrentPage(1);
    };

    const tableColumns = [
        { key: 'title', header: 'Название', render: (task) => <strong>{task.title}</strong> },
        { key: 'Iteration', header: 'Итерация', render: (task) => task.Iteration?.name || '—' },
        { key: 'Assignee', header: 'Исполнитель', render: (task) => task.Assignee?.full_name || '—' },
        { key: 'Project', header: 'Проект', render: (task) => task.Project?.name || '—' },
        { key: 'priority', header: 'Приоритет', render: (task) => task.priority },
        { key: 'status', header: 'Статус', render: (task) => task.status },
    ];

    const sortingFields = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'По названию' },
        { key: 'priority', label: 'По приоритету' },
        { key: 'status', label: 'По статусу' },
        { key: 'Iteration.name', label: 'По итерации' },
    ];

    const additionalControls = () => (
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
                <label>Проект:</label>
                <select value={filterProject} onChange={(e) => handleFilterProjectChange(e.target.value)}>
                    <option value="">Все проекты</option>
                    {loadingProjects ? (
                        <option disabled>Загрузка проектов...</option>
                    ) : projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                            {proj.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Статус:</label>
                <select value={filterStatus} onChange={(e) => handleFilterStatusChange(e.target.value)}>
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

    if (tasksLoading && currentPage === 1) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка задач...</p>;
    }

    return (
        <div>
            <h2>Задачи</h2>
            <button
                type="button"
                onClick={() => openTaskModal(null, true)}
                style={{
                    padding: '10px 20px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Добавить задачу
            </button>

            <SortingControls
                sortField={sortField}
                sortDirection={sortDirection}
                onSortFieldChange={handleSortFieldChange}
                onSortDirectionChange={handleSortDirectionChange}
                availableFields={sortingFields}
                onResetFilters={resetFilters}
                additionalControls={additionalControls}
                title="Фильтры и сортировка"
            />

            <DataTable
                data={tasks}
                columns={tableColumns}
                emptyMessage="Задач не найдено"
                onView={(task) => openTaskModal(task, false)}
                onEdit={(task) => openTaskModal(task, true)}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalTasks}
                pageSize={limit}
                onPageChange={(page) => setCurrentPage(page)}
                loading={tasksLoading}
            />

            <Modal
                isOpen={modalTask !== null || isEditMode}
                onClose={closeModal}
                title={isEditMode ? (modalTask ? 'Редактировать задачу' : 'Создать задачу') : 'Просмотр задачи'}
            >
                <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
                    {isEditMode ? (
                        <form onSubmit={handleSubmit}>
                            {serverError && <p style={{ color: 'red' }}>{serverError}</p>}

                            <div style={{ marginBottom: '15px' }}>
                                <label>Заголовок *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                />
                                {formErrors.title && <p style={{ color: 'red' }}>{formErrors.title}</p>}
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label>Описание</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label>Проект *</label>
                                <select
                                    value={formData.project_id}
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value, iteration_id: '' })}
                                    style={{ width: '100%', padding: '10px' }}
                                    disabled={loadingProjects}
                                >
                                    <option value="">Выберите проект</option>
                                    {loadingProjects ? (
                                        <option disabled>Загрузка проектов...</option>
                                    ) : projects.map((proj) => (
                                        <option key={proj.id} value={proj.id}>
                                            {proj.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.project_id && <p style={{ color: 'red' }}>{formErrors.project_id}</p>}
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label>Итерация (Спринт)</label>
                                <select
                                    value={formData.iteration_id}
                                    onChange={(e) => setFormData({ ...formData, iteration_id: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                    disabled={!formData.project_id || loadingIterations}
                                    size={5}
                                >
                                    <option value="">— Без итерации —</option>
                                    {loadingIterations ? (
                                        <option disabled>Загрузка итераций...</option>
                                    ) : iterations.map((iter) => (
                                        <option key={iter.id} value={iter.id}>
                                            {iter.name} ({iter.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label>Исполнитель (Assignee)</label>
                                    <select
                                        value={formData.assignee_id}
                                        onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                                        style={{ width: '100%', padding: '10px' }}
                                        disabled={!formData.project_id || loadingMembers}
                                        size={5}
                                    >
                                        <option value="">— Не назначен —</option>
                                        {projectMembers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Репортер (Reporter)</label>
                                    <select
                                        value={formData.reporter_id}
                                        onChange={(e) => setFormData({ ...formData, reporter_id: e.target.value })}
                                        style={{ width: '100%', padding: '10px' }}
                                        disabled={!formData.project_id || loadingMembers}
                                        size={5}
                                    >
                                        <option value="">— Не назначен —</option>
                                        {projectMembers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label>Приоритет</label>
                                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%', padding: '10px' }}>
                                        <option value="low">Низкий</option>
                                        <option value="medium">Средний</option>
                                        <option value="high">Высокий</option>
                                        <option value="critical">Критический</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Статус</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px' }}>
                                        <option value="backlog">Бэклог</option>
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">В работе</option>
                                        <option value="review">На проверке</option>
                                        <option value="done">Готово</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label>Story Points</label>
                                    <input type="number" min="1" max="13" value={formData.story_points} onChange={(e) => setFormData({ ...formData, story_points: e.target.value })} style={{ width: '100%', padding: '10px' }} />
                                </div>
                                <div>
                                    <label>Срок</label>
                                    <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} style={{ width: '100%', padding: '10px' }} />
                                </div>
                            </div>

                            {modalTask?.Attachments && modalTask.Attachments.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Существующие изображения ({modalTask.Attachments.length}):</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
                                        {modalTask.Attachments.map((att) => {
                                            const fullImageUrl = `http://localhost:5000${att.file_url}`;
                                            return (
                                                <div key={att.id} style={{ textAlign: 'center' }}>
                                                    <img
                                                        src={fullImageUrl}
                                                        alt={att.file_name}
                                                        style={{
                                                            maxWidth: '250px',
                                                            maxHeight: '250px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/250?text=Ошибка+загрузки';
                                                        }}
                                                    />
                                                    <p style={{ marginTop: '5px', fontSize: '14px', wordBreak: 'break-all' }}>
                                                        {att.file_name}
                                                    </p>
                                                    <button
                                                        onClick={() => handleDeleteAttachment(att.id)}
                                                        style={{ marginTop: '5px', padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label>Добавить изображения (до 10)</label>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '10px' }} />
                                {selectedFiles.length > 0 && <p>Выбрано файлов: {selectedFiles.length}</p>}
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
                                {isEditMode ? 'Сохранить изменения' : 'Создать задачу'}
                            </button>
                        </form>
                    ) : (
                        <div>
                            <h3>{modalTask?.title}</h3>
                            <p><strong>Описание:</strong> {modalTask?.description || '—'}</p>
                            <p><strong>Проект:</strong> {modalTask?.Project?.name || '—'}</p>
                            <p><strong>Итерация:</strong> {modalTask?.Iteration?.name || '—'}</p>
                            <p><strong>Приоритет:</strong> {modalTask?.priority}</p>
                            <p><strong>Статус:</strong> {modalTask?.status}</p>
                            <p><strong>Story Points:</strong> {modalTask?.story_points || '—'}</p>
                            <p><strong>Срок:</strong> {modalTask?.due_date || '—'}</p>
                            <p><strong>Исполнитель:</strong> {modalTask?.Assignee?.full_name || '—'}</p>
                            <p><strong>Репортер:</strong> {modalTask?.Reporter?.full_name || '—'}</p>

                            {modalTask?.Attachments && modalTask.Attachments.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4>Изображения ({modalTask.Attachments.length}):</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
                                        {modalTask.Attachments.map((att) => {
                                            const fullImageUrl = `http://localhost:5000${att.file_url}`;
                                            return (
                                                <div key={att.id} style={{ textAlign: 'center' }}>
                                                    <img
                                                        src={fullImageUrl}
                                                        alt={att.file_name}
                                                        style={{
                                                            maxWidth: '250px',
                                                            maxHeight: '250px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/250?text=Ошибка+загрузки';
                                                        }}
                                                    />
                                                    <p style={{ marginTop: '5px', fontSize: '14px', wordBreak: 'break-all' }}>
                                                        {att.file_name}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <button onClick={() => setIsEditMode(true)} style={{ marginTop: '20px', padding: '12px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
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