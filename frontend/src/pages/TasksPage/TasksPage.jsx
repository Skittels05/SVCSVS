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
import { handleApiError } from '../../utils/handleApiError';

const TasksPage = () => {
    const dispatch = useDispatch();
    const { list: tasks, loading } = useSelector((state) => state.tasks);

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
        assignee_id: '',
        reporter_id: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterProject, setFilterProject] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [totalTasks, setTotalTasks] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

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

    const openTaskModal = (task, edit = false) => {
        setModalTask(task);
        setIsEditMode(edit);
        setFormData(task ? {
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            story_points: task.story_points?.toString() || '',
            due_date: task.due_date || '',
            project_id: task.project_id?.toString() || '',
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
        };

        const action = modalTask
            ? updateTask({ id: modalTask.id, taskData })
            : createTask(taskData);

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

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка задач...</p>;

    return (
        <div>
            <h2>Задачи</h2>
            <button onClick={() => openTaskModal(null, true)}>Добавить задачу</button>

            <div style={{ margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Фильтры:</strong>
                <select value={filterProject} onChange={(e) => { setFilterProject(e.target.value); setCurrentPage(1); }}>
                    <option value="">Все проекты</option>
                    <option value="1">Разработка CRM</option>
                    <option value="2">Модернизация сайта</option>
                    <option value="6">Система аналитики</option>
                </select>

                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                    <option value="">Все статусы</option>
                    <option value="backlog">Бэклог</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">В работе</option>
                    <option value="review">На проверке</option>
                    <option value="done">Готово</option>
                </select>
            </div>

            <table style={{ width: '100%', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Исполнитель</th>
                        <th>Проект</th>
                        <th>Приоритет</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                Задач не найдено
                            </td>
                        </tr>
                    ) : (
                        tasks.map((task) => (
                            <tr key={task.id}>
                                <td>{task.title}</td>
                                <td>{task.Assignee?.full_name || '—'}</td>
                                <td>{task.Project?.name || '—'}</td>
                                <td>{task.priority}</td>
                                <td>{task.status}</td>
                                <td>
                                    <button onClick={() => openTaskModal(task, false)}>Просмотреть</button>
                                    <button onClick={() => openTaskModal(task, true)} style={{ marginLeft: '10px' }}>
                                        Редактировать
                                    </button>
                                    <button className="danger" onClick={() => handleDelete(task.id)} style={{ marginLeft: '10px' }}>
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    ← Назад
                </button>
                <span style={{ margin: '0 30px', fontSize: '18px' }}>
                    Страница {currentPage} из {totalPages} (всего {totalTasks} задач)
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Вперед →
                </button>
            </div>

            <Modal
                isOpen={!!modalTask}
                onClose={closeModal}
                title={isEditMode ? 'Редактировать задачу' : 'Просмотр задачи'}
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
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                >
                                    <option value="">Выберите проект</option>
                                    <option value="1">Разработка CRM</option>
                                    <option value="2">Модернизация сайта</option>
                                    <option value="6">Система аналитики</option>
                                </select>
                                {formErrors.project_id && <p style={{ color: 'red' }}>{formErrors.project_id}</p>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label>Приоритет</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        style={{ width: '100%', padding: '10px' }}
                                    >
                                        <option value="low">Низкий</option>
                                        <option value="medium">Средний</option>
                                        <option value="high">Высокий</option>
                                        <option value="critical">Критический</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Статус</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{ width: '100%', padding: '10px' }}
                                    >
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
                                    <input
                                        type="number"
                                        min="1"
                                        max="13"
                                        value={formData.story_points}
                                        onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
                                        style={{ width: '100%', padding: '10px' }}
                                    />
                                </div>

                                <div>
                                    <label>Срок</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        style={{ width: '100%', padding: '10px' }}
                                    />
                                </div>
                            </div>

                            {modalTask?.Attachments && modalTask.Attachments.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Существующие изображения ({modalTask.Attachments.length}):</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
                                        {modalTask.Attachments.map((att) => {
                                            const fullImageUrl = `http://localhost:5000${att.file_url}`;
                                            console.log('Пытаемся загрузить изображение по URL:', fullImageUrl);
                                            console.log('Данные вложения:', att);

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
                                                            console.error('ОШИБКА ЗАГРУЗКИ ИЗОБРАЖЕНИЯ:', fullImageUrl);
                                                            e.target.src = 'https://via.placeholder.com/250?text=Ошибка+загрузки';
                                                            e.target.alt = 'Не удалось загрузить изображение';
                                                        }}
                                                        onLoad={() => {
                                                            console.log('УСПЕШНО ЗАГРУЖЕНО:', fullImageUrl);
                                                        }}
                                                    />
                                                    <p style={{ marginTop: '5px', fontSize: '14px', wordBreak: 'break-all' }}>
                                                        {att.file_name}
                                                    </p>
                                                    <button
                                                        className="danger"
                                                        onClick={() => handleDeleteAttachment(att.id)}
                                                        style={{ marginTop: '5px', padding: '5px 10px', background: '#e74c3c', color: 'white' }}
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
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ width: '100%', padding: '10px' }}
                                />
                                {selectedFiles.length > 0 && (
                                    <p>Выбрано файлов: {selectedFiles.length}</p>
                                )}
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '15px', background: '#3498db', color: 'white' }}>
                                Сохранить изменения
                            </button>
                        </form>
                    ) : (
                        <div>
                            <h3>{modalTask?.title}</h3>
                            <p><strong>Описание:</strong> {modalTask?.description || '—'}</p>
                            <p><strong>Проект:</strong> {modalTask?.Project?.name || '—'}</p>
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
                                            console.log('Пытаемся загрузить изображение по URL:', fullImageUrl);
                                            console.log('Данные вложения:', att);

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
                                                            console.error('ОШИБКА ЗАГРУЗКИ ИЗОБРАЖЕНИЯ:', fullImageUrl);
                                                            e.target.src = 'https://via.placeholder.com/250?text=Ошибка+загрузки';
                                                            e.target.alt = 'Не удалось загрузить изображение';
                                                        }}
                                                        onLoad={() => {
                                                            console.log('УСПЕШНО ЗАГРУЖЕНО:', fullImageUrl);
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

                            <button onClick={() => setIsEditMode(true)} style={{ marginTop: '20px', padding: '12px 20px' }}>
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