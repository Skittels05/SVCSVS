import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProjectMembers,
    createProjectMember,
    updateProjectMember,
    deleteProjectMember,
} from '../../store/slices/projectMembersSlice';
import Modal from '../../components/Modal/Modal';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SortingControls from '../../components/SortingControls/SortingControls';
import api from '../../services/api';
import { handleApiError } from '../../utils/handleApiError';

const ProjectMembersPage = () => {
    const dispatch = useDispatch();
    const { list: members, loading } = useSelector((state) => state.projectMembers);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [formData, setFormData] = useState({
        project_id: '',
        user_id: '',
        role: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterProject, setFilterProject] = useState('');

    const [totalMembers, setTotalMembers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

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
        if (filterProject) params.project_id = filterProject;

        dispatch(fetchProjectMembers(params))
            .unwrap()
            .then((payload) => {
                setTotalMembers(payload.total || 0);
                setTotalPages(payload.pages || 1);
            });
    }, [dispatch, currentPage, sortField, sortDirection, filterProject]);

    const openModal = (member = null) => {
        setCurrentMember(member);
        setIsEditMode(!!member);
        setFormData(member ? {
            project_id: member.project_id?.toString() || '',
            user_id: member.user_id?.toString() || '',
            role: member.role || '',
        } : {
            project_id: '',
            user_id: '',
            role: '',
        });
        setFormErrors({});
        setServerError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentMember(null);
        setIsEditMode(false);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.project_id) errors.project_id = 'Выберите проект';
        if (!formData.user_id) errors.user_id = 'Выберите пользователя';
        if (!formData.role.trim()) errors.role = 'Укажите роль';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setServerError('');
        setFormErrors({});

        const memberData = {
            project_id: parseInt(formData.project_id),
            user_id: parseInt(formData.user_id),
            role: formData.role.trim(),
        };

        const action = isEditMode
            ? updateProjectMember({ id: currentMember.id, memberData })
            : createProjectMember(memberData);

        const resultAction = await dispatch(action);

        if (resultAction.type.endsWith('/rejected')) {
            handleApiError(resultAction, setFormErrors, setServerError);
        } else {
            closeModal();
            dispatch(fetchProjectMembers({ page: currentPage, limit }));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Удалить участника из проекта?')) {
            dispatch(deleteProjectMember(id));
        }
    };

    const tableColumns = [
        { key: 'id', header: 'ID' },
        { key: 'Project', header: 'Проект', render: (m) => m.Project?.name || '—' },
        { key: 'User', header: 'Пользователь', render: (m) => m.User ? `${m.User.full_name} (${m.User.email})` : '—' },
        { key: 'role', header: 'Роль' },
    ];

    const sortingFields = [
        { key: 'id', label: 'ID' },
        { key: 'role', label: 'По роли' },
        { key: 'Project.name', label: 'По проекту' },
        { key: 'User.full_name', label: 'По пользователю' },
    ];

    const additionalControls = () => (
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
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
        </div>
    );

    if (loading && currentPage === 1) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка участников...</p>;
    }

    return (
        <div>
            <h2>Участники проектов</h2>
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
                Добавить участника
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
                data={members}
                columns={tableColumns}
                emptyMessage="Участников не найдено"
                onEdit={openModal}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalMembers}
                pageSize={limit}
                onPageChange={setCurrentPage}
                loading={loading}
            />

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={isEditMode ? 'Редактировать участника' : 'Добавить участника в проект'}
            >
                <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
                    <form onSubmit={handleSubmit}>
                        {serverError && <p style={{ color: 'red', marginBottom: '15px' }}>{serverError}</p>}

                        <div style={{ marginBottom: '15px' }}>
                            <label>Проект *</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                }}
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

                        <div style={{ marginBottom: '15px' }}>
                            <label>Пользователь *</label>
                            <select
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                }}
                                size={5}
                                disabled={loadingUsers}
                            >
                                <option value="">Выберите пользователя</option>
                                {loadingUsers ? (
                                    <option disabled>Загрузка пользователей...</option>
                                ) : users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {formErrors.user_id && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.user_id}</p>}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label>Роль в проекте *</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                style={{ width: '100%', padding: '10px' }}
                                placeholder="Например: Team Lead, Developer"
                            />
                            {formErrors.role && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.role}</p>}
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
                            {isEditMode ? 'Сохранить изменения' : 'Добавить участника'}
                        </button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectMembersPage;