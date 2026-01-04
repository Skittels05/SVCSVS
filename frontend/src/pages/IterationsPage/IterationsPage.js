import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchIterations,
    createIteration,
    updateIteration,
    deleteIteration,
} from '../../store/slices/iterationsSlice';
import Modal from '../../components/Modal/Modal';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SortingControls from '../../components/SortingControls/SortingControls';
import api from '../../services/api';
import { handleApiError } from '../../utils/handleApiError';

const IterationsPage = () => {
    const dispatch = useDispatch();
    const { list: iterations, loading } = useSelector((state) => state.iterations);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentIteration, setCurrentIteration] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'sprint',
        project_id: '',
        start_date: '',
        end_date: '',
        status: 'planned',
    });
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');

    // Для фильтров
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Пагинация, сортировка, фильтры
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterProject, setFilterProject] = useState('');
    const [filterType, setFilterType] = useState(''); // ← Новый фильтр по типу

    const [totalIterations, setTotalIterations] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Загрузка проектов
    useEffect(() => {
        const loadProjects = async () => {
            setLoadingProjects(true);
            try {
                const response = await api.get('/projects');
                setProjects(response.data.data || response.data);
            } catch (err) {
                console.error('Ошибка загрузки проектов:', err);
                setProjects([]);
            } finally {
                setLoadingProjects(false);
            }
        };
        loadProjects();
    }, []);

    // Загрузка итераций с фильтрами
    useEffect(() => {
        const params = {
            page: currentPage,
            limit,
            sort: `${sortField}:${sortDirection}`,
        };
        if (filterProject) params.project_id = filterProject;
        if (filterType) params.type = filterType; // ← Добавлен фильтр по типу

        dispatch(fetchIterations(params))
            .unwrap()
            .then((payload) => {
                setTotalIterations(payload.total || 0);
                setTotalPages(payload.pages || 1);
            });
    }, [dispatch, currentPage, sortField, sortDirection, filterProject, filterType]);

    const openModal = (iteration = null) => {
        setCurrentIteration(iteration);
        setIsEditMode(!!iteration);
        setFormData(iteration ? {
            name: iteration.name,
            type: iteration.type,
            project_id: iteration.project_id?.toString() || '',
            start_date: iteration.start_date || '',
            end_date: iteration.end_date || '',
            status: iteration.status,
        } : {
            name: '',
            type: 'sprint',
            project_id: '',
            start_date: '',
            end_date: '',
            status: 'planned',
        });
        setFormErrors({});
        setServerError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentIteration(null);
        setIsEditMode(false);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Название обязательно';
        if (!formData.project_id) errors.project_id = 'Выберите проект';
        if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
            errors.end_date = 'Дата окончания не может быть раньше начала';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setServerError('');
        setFormErrors({});

        const iterationData = {
            name: formData.name.trim(),
            type: formData.type,
            project_id: parseInt(formData.project_id),
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            status: formData.status,
        };

        const action = isEditMode
            ? updateIteration({ id: currentIteration.id, iterationData })
            : createIteration(iterationData);

        const resultAction = await dispatch(action);

        if (resultAction.type.endsWith('/rejected')) {
            handleApiError(resultAction, setFormErrors, setServerError);
        } else {
            closeModal();
            dispatch(fetchIterations({ page: currentPage, limit }));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Удалить итерацию? Связанные задачи могут быть затронуты.')) {
            dispatch(deleteIteration(id));
        }
    };

    const tableColumns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Название', render: (i) => <strong>{i.name}</strong> },
        { key: 'Project', header: 'Проект', render: (i) => i.Project?.name || '—' },
        { key: 'type', header: 'Тип', render: (i) => i.type === 'sprint' ? 'Спринт' : 'Фаза' },
        { key: 'start_date', header: 'Начало', render: (i) => i.start_date || '—' },
        { key: 'end_date', header: 'Окончание', render: (i) => i.end_date || '—' },
        {
            key: 'status',
            header: 'Статус',
            render: (i) => {
                const statusMap = {
                    planned: 'Планируется',
                    active: 'Активна',
                    completed: 'Завершена'
                };
                return statusMap[i.status] || i.status;
            }
        },
    ];

    const sortingFields = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'По названию' },
        { key: 'type', label: 'По типу' },
        { key: 'status', label: 'По статусу' },
        { key: 'start_date', label: 'По дате начала' },
        { key: 'end_date', label: 'По дате окончания' },
        { key: 'Project.name', label: 'По проекту' },
    ];

    const additionalControls = () => (
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
                <label>Фильтр по проекту:</label>
                <select value={filterProject} onChange={(e) => { setFilterProject(e.target.value); setCurrentPage(1); }}>
                    <option value="">Все проекты</option>
                    {loadingProjects ? (
                        <option disabled>Загрузка...</option>
                    ) : projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>{proj.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Фильтр по типу:</label>
                <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
                    <option value="">Все типы</option>
                    <option value="sprint">Спринт</option>
                    <option value="phase">Фаза</option>
                </select>
            </div>
        </div>
    );

    if (loading && currentPage === 1) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка итераций...</p>;
    }

    return (
        <div>
            <h2>Итерации</h2>

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
                Добавить итерацию
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
                data={iterations}
                columns={tableColumns}
                emptyMessage="Итераций не найдено"
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalIterations}
                pageSize={limit}
                onPageChange={setCurrentPage}
                loading={loading}
            />

            {/* Модальное окно — без изменений */}
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={isEditMode ? 'Редактировать итерацию' : 'Добавить итерацию'}
            >
                <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
                    <form onSubmit={handleSubmit}>
                        {serverError && <p style={{ color: 'red', marginBottom: '15px' }}>{serverError}</p>}

                        <div style={{ marginBottom: '15px' }}>
                            <label>Название *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px' }}
                            />
                            {formErrors.name && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.name}</p>}
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label>Проект *</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                style={{ width: '100%', padding: '10px' }}
                                size={5}
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
                            {formErrors.project_id && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.project_id}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label>Тип</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                >
                                    <option value="sprint">Спринт</option>
                                    <option value="phase">Фаза</option>
                                </select>
                            </div>

                            <div>
                                <label>Статус</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                >
                                    <option value="planned">Планируется</option>
                                    <option value="active">Активна</option>
                                    <option value="completed">Завершена</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <label>Дата начала</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>

                            <div>
                                <label>Дата окончания</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                />
                                {formErrors.end_date && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.end_date}</p>}
                            </div>
                        </div>

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
                            {isEditMode ? 'Сохранить изменения' : 'Создать итерацию'}
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default IterationsPage;