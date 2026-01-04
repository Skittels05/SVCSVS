import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAttachments,
    createAttachments,
    updateAttachment,
    deleteAttachment,
} from '../../store/slices/attachmentsSlice';
import Modal from '../../components/Modal/Modal';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SortingControls from '../../components/SortingControls/SortingControls';
import api from '../../services/api';
import { handleApiError } from '../../utils/handleApiError';

const AttachmentsPage = () => {
    const dispatch = useDispatch();
    const { list: attachments, loading } = useSelector((state) => state.attachments);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentAttachment, setCurrentAttachment] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        task_id: '',
        file_name: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterTask, setFilterTask] = useState('');
    const [filterUser, setFilterUser] = useState('');

    const [totalAttachments, setTotalAttachments] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const loadTasks = async () => {
            setLoadingTasks(true);
            try {
                const response = await api.get('/tasks?limit=1000');
                setTasks(response.data.data || []);
            } catch (err) {
                console.error('Ошибка загрузки задач:', err);
                setTasks([]);
            } finally {
                setLoadingTasks(false);
            }
        };
        loadTasks();
    }, []);

    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await api.get('/users');
                setUsers(response.data.data || response.data);
            } catch (err) {
                console.error('Ошибка загрузки пользователей:', err);
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, []);

    useEffect(() => {
        const params = {
            page: currentPage,
            limit,
            sort: `${sortField}:${sortDirection}`,
        };
        if (filterTask) params.task_id = filterTask;
        if (filterUser) params.user_id = filterUser;

        dispatch(fetchAttachments(params))
            .unwrap()
            .then((payload) => {
                setTotalAttachments(payload.total || 0);
                setTotalPages(payload.pages || 1);
            });
    }, [dispatch, currentPage, sortField, sortDirection, filterTask, filterUser]);

    const openModal = (attachment = null) => {
        setCurrentAttachment(attachment);
        setIsEditMode(!!attachment);
        setFormData({
            task_id: attachment?.task_id?.toString() || '',
            file_name: attachment?.file_name || '',
        });
        setSelectedFiles([]);
        setFormErrors({});
        setServerError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentAttachment(null);
        setIsEditMode(false);
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const validateForm = () => {
        const errors = {};
        if (!isEditMode && selectedFiles.length === 0) errors.files = 'Выберите хотя бы одно изображение';
        if (!formData.task_id) errors.task_id = 'Выберите задачу';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setServerError('');
        setFormErrors({});

        if (isEditMode) {
            const resultAction = await dispatch(updateAttachment({
                id: currentAttachment.id,
                attachmentData: {
                    task_id: parseInt(formData.task_id),
                    file_name: formData.file_name.trim(),
                },
            }));

            if (resultAction.type.endsWith('/rejected')) {
                handleApiError(resultAction, setFormErrors, setServerError);
            } else {
                closeModal();
                dispatch(fetchAttachments({ page: currentPage, limit }));
            }
        } else {
            if (selectedFiles.length === 0) return;

            const form = new FormData();
            selectedFiles.forEach(file => form.append('files', file));
            form.append('task_id', formData.task_id);
            form.append('user_id', 1);

            const resultAction = await dispatch(createAttachments(form));

            if (resultAction.type.endsWith('/rejected')) {
                handleApiError(resultAction, setFormErrors, setServerError);
            } else {
                closeModal();
                dispatch(fetchAttachments({ page: currentPage, limit }));
            }
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Удалить изображение? Файл будет удалён с сервера.')) {
            dispatch(deleteAttachment(id));
        }
    };

    const tableColumns = [
        { key: 'id', header: 'ID' },
        {
            key: 'file_url',
            header: 'Изображение',
            render: (att) => {
                const fullUrl = `http://localhost:5000${att.file_url}`;
                return (
                    <img
                        src={fullUrl}
                        alt={att.file_name}
                        style={{
                            maxWidth: '150px',
                            maxHeight: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Ошибка';
                        }}
                    />
                );
            }
        },
        { key: 'file_name', header: 'Имя файла' },
        { key: 'Task', header: 'Задача', render: (att) => att.Task?.title || '—' },
        { key: 'Uploader', header: 'Загрузил', render: (att) => att.Uploader?.full_name || '—' },
        { key: 'created_at', header: 'Дата', render: (att) => new Date(att.created_at).toLocaleString('ru-RU') },
    ];

    const sortingFields = [
        { key: 'id', label: 'ID' },
        { key: 'file_name', label: 'По имени файла' },
        { key: 'Task.title', label: 'По задаче' },
        { key: 'Uploader.full_name', label: 'По пользователю' },
        { key: 'created_at', label: 'По дате' },
    ];

    const additionalControls = () => (
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
                <label>Фильтр по задаче:</label>
                <select value={filterTask} onChange={(e) => { setFilterTask(e.target.value); setCurrentPage(1); }}>
                    <option value="">Все задачи</option>
                    {loadingTasks ? (
                        <option disabled>Загрузка...</option>
                    ) : tasks.map((task) => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Фильтр по пользователю:</label>
                <select value={filterUser} onChange={(e) => { setFilterUser(e.target.value); setCurrentPage(1); }}>
                    <option value="">Все пользователи</option>
                    {loadingUsers ? (
                        <option disabled>Загрузка...</option>
                    ) : users.map((user) => (
                        <option key={user.id} value={user.id}>{user.full_name}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    if (loading && currentPage === 1) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка вложений...</p>;
    }

    return (
        <div>
            <h2>Вложения (изображения)</h2>

            <button
                onClick={() => openModal()}
                style={{
                    padding: '10px 20px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    cursor: 'pointer'
                }}
            >
                Добавить изображения
            </button>

            <SortingControls
                sortField={sortField}
                sortDirection={sortDirection}
                onSortFieldChange={(f) => { setSortField(f); setCurrentPage(1); }}
                onSortDirectionChange={(d) => { setSortDirection(d); setCurrentPage(1); }}
                availableFields={sortingFields}
                additionalControls={additionalControls}
                title="Фильтры и сортировка"
            />

            <DataTable
                data={attachments}
                columns={tableColumns}
                emptyMessage="Вложений не найдено"
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalAttachments}
                pageSize={limit}
                onPageChange={setCurrentPage}
                loading={loading}
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={isEditMode ? 'Редактировать вложение' : 'Добавить изображения'}
            >
                <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
                    <form onSubmit={handleSubmit}>
                        {serverError && <p style={{ color: 'red', marginBottom: '15px' }}>{serverError}</p>}

                        <div style={{ marginBottom: '15px' }}>
                            <label>Задача *</label>
                            <select
                                value={formData.task_id}
                                onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                                style={{ width: '100%', padding: '10px' }}
                                size={5}
                                disabled={loadingTasks}
                            >
                                <option value="">Выберите задачу</option>
                                {loadingTasks ? (
                                    <option disabled>Загрузка задач...</option>
                                ) : tasks.map((task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.title}
                                    </option>
                                ))}
                            </select>
                            {formErrors.task_id && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.task_id}</p>}
                        </div>

                        {!isEditMode && (
                            <div style={{ marginBottom: '20px' }}>
                                <label>Изображения (до 10) *</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ width: '100%', padding: '10px' }}
                                />
                                {selectedFiles.length > 0 && <p>Выбрано файлов: {selectedFiles.length}</p>}
                                {formErrors.files && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.files}</p>}
                            </div>
                        )}

                        {isEditMode && (
                            <div style={{ marginBottom: '15px' }}>
                                <label>Имя файла</label>
                                <input
                                    type="text"
                                    value={formData.file_name}
                                    onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>
                        )}

                        {isEditMode && currentAttachment && (
                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <img
                                    src={`http://localhost:5000${currentAttachment.file_url}`}
                                    alt={currentAttachment.file_name}
                                    style={{
                                        maxWidth: '300px',
                                        maxHeight: '300px',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    }}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                            }}
                        >
                            {isEditMode ? 'Сохранить изменения' : 'Загрузить изображения'}
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default AttachmentsPage;