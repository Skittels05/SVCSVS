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
import './ProjectMembersPage.css';

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
        const response = await api.get('/projects?limit=1000');
        setProjects(response.data.data || response.data);
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
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
        const response = await api.get('/users?limit=1000');
        setUsers(response.data.data || response.data);
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
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

    try {
      if (isEditMode) {
        await dispatch(updateProjectMember({ id: currentMember.id, memberData })).unwrap();
      } else {
        await dispatch(createProjectMember(memberData)).unwrap();
      }
      closeModal();
    } catch (err) {
      handleApiError(err, setFormErrors, setServerError);
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
    {
      key: 'User',
      header: 'Пользователь',
      render: (m) => m.User ? (
        <div>
          <strong>{m.User.full_name}</strong><br />
          <small>{m.User.email}</small>
        </div>
      ) : '—'
    },
    {
      key: 'role',
      header: 'Роль',
      render: (m) => <span className="role-tag">{m.role}</span>
    },
  ];

  const sortingFields = [
    { key: 'id', label: 'ID' },
    { key: 'role', label: 'Роль' },
    { key: 'Project.name', label: 'Проект' },
    { key: 'User.full_name', label: 'Имя пользователя' },
  ];

  const additionalFilters = () => (
    <div className="filter-group">
      <div className="filter-item">
        <label>По проекту:</label>
        <select
          value={filterProject}
          onChange={(e) => { setFilterProject(e.target.value); setCurrentPage(1); }}
          disabled={loadingProjects}
        >
          <option value="">Все проекты</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>{proj.name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading && currentPage === 1) {
    return <div className="page-loading">Загрузка участников проектов...</div>;
  }

  return (
    <div className="project-members-page">
      <div className="page-header">
        <h2>Участники проектов</h2>
        <button onClick={() => openModal()} className="btn btn-success btn-add">
          + Добавить участника
        </button>
      </div>

      <SortingControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={(f) => { setSortField(f); setCurrentPage(1); }}
        onSortDirectionChange={(d) => { setSortDirection(d); setCurrentPage(1); }}
        availableFields={sortingFields}
        additionalControls={additionalFilters}
        title="Фильтры и сортировка"
      />

      <DataTable
        data={members}
        columns={tableColumns}
        emptyMessage="Участников проектов не найдено"
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
        <form onSubmit={handleSubmit} className="member-form">
          {serverError && <div className="error-message">{serverError}</div>}

          <div className="form-group">
            <label>Проект *</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="form-select large-select"
              disabled={loadingProjects}
            >
              <option value="">Выберите проект</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
            {formErrors.project_id && <span className="error-text">{formErrors.project_id}</span>}
          </div>

          <div className="form-group">
            <label>Пользователь *</label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="form-select large-select"
              disabled={loadingUsers}
            >
              <option value="">Выберите пользователя</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
            {formErrors.user_id && <span className="error-text">{formErrors.user_id}</span>}
          </div>

          <div className="form-group">
            <label>Роль в проекте *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-input"
              placeholder="Например: Team Lead, Developer, QA"
            />
            {formErrors.role && <span className="error-text">{formErrors.role}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-submit">
            {isEditMode ? 'Сохранить изменения' : 'Добавить участника'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectMembersPage;