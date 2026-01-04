import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
} from '../../store/slices/projectsSlice'; // ← создадим ниже
import Modal from '../../components/Modal/Modal';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SortingControls from '../../components/SortingControls/SortingControls';
import { handleApiError } from '../../utils/handleApiError';

const ProjectsPage = () => {
    const dispatch = useDispatch();
    const { list: projects, loading } = useSelector((state) => state.projects);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        project_type: 'scrum',
        status: 'planned',
    });

    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    const [totalProjects, setTotalProjects] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        dispatch(
            fetchProjects({
                page: currentPage,
                limit,
                sort: `${sortField}:${sortDirection}`,
            })
        )
            .unwrap()
            .then((payload) => {
                setTotalProjects(payload.total || 0);
                setTotalPages(payload.pages || 1);
            });
    }, [dispatch, currentPage, sortField, sortDirection]);

    const openModal = (project = null) => {
        setCurrentProject(project);
        setIsEditMode(!!project);
        setFormData(project ? {
            name: project.name,
            description: project.description || '',
            project_type: project.project_type,
            status: project.status,
        } : {
            name: '',
            description: '',
            project_type: 'scrum',
            status: 'planned',
        });
        setFormErrors({});
        setServerError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentProject(null);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Название проекта обязательно';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setServerError('');
        setFormErrors({});

        const action = isEditMode
            ? updateProject({ id: currentProject.id, projectData: formData })
            : createProject(formData);

        const resultAction = await dispatch(action);

        if (resultAction.type.endsWith('/rejected')) {
            handleApiError(resultAction, setFormErrors, setServerError);
        } else {
            closeModal();
            dispatch(fetchProjects({ page: currentPage, limit }));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Удалить проект? Все связанные задачи и участники будут затронуты.')) {
            dispatch(deleteProject(id));
        }
    };

    const tableColumns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Название', render: (proj) => <strong>{proj.name}</strong> },
        { key: 'description', header: 'Описание', render: (proj) => proj.description || '—' },
        {
            key: 'project_type',
            header: 'Тип',
            render: (proj) => proj.project_type === 'scrum' ? 'Scrum' : 'Waterfall'
        },
        {
            key: 'status',
            header: 'Статус',
            render: (proj) => {
                const statusMap = {
                    planned: 'Планируется',
                    active: 'Активен',
                    completed: 'Завершён'
                };
                return statusMap[proj.status] || proj.status;
            }
        },
    ];

    const sortingFields = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'По названию' },
        { key: 'project_type', label: 'По типу' },
        { key: 'status', label: 'По статусу' },
        { key: 'created_at', label: 'По дате создания' },
    ];

    if (loading && currentPage === 1) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка проектов...</p>;
    }

    return (
        <div>
            <h2>Проекты</h2>
            <button
                onClick={() => openModal()}
                style={{
                    padding: '10px 20px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Добавить проект
            </button>

            <SortingControls
                sortField={sortField}
                sortDirection={sortDirection}
                onSortFieldChange={(field) => { setSortField(field); setCurrentPage(1); }}
                onSortDirectionChange={(dir) => { setSortDirection(dir); setCurrentPage(1); }}
                availableFields={sortingFields}
                title="Сортировка"
            />

            <DataTable
                data={projects}
                columns={tableColumns}
                emptyMessage="Проектов не найдено"
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalProjects}
                pageSize={limit}
                onPageChange={setCurrentPage}
                loading={loading}
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={isEditMode ? 'Редактировать проект' : 'Добавить проект'}
            >
                <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
                    <form onSubmit={handleSubmit}>
                        {serverError && (
                            <p style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
                                {serverError}
                            </p>
                        )}

                        <div style={{ marginBottom: '15px' }}>
                            <label>Название *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {formErrors.name && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.name}</p>}
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label>Описание</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                                <label>Тип проекта</label>
                                <select
                                    value={formData.project_type}
                                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                                    style={{ width: '100%', padding: '10px' }}
                                >
                                    <option value="scrum">Scrum</option>
                                    <option value="waterfall">Waterfall</option>
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
                                    <option value="active">Активен</option>
                                    <option value="completed">Завершён</option>
                                </select>
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
                                cursor: 'pointer'
                            }}
                        >
                            {isEditMode ? 'Сохранить изменения' : 'Создать проект'}
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectsPage;