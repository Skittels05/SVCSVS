import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../../store/slices/projectsSlice';
import Modal from '../../components/Modal/Modal';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SortingControls from '../../components/SortingControls/SortingControls';
import { handleApiError } from '../../utils/handleApiError';
import './ProjectsPage.css';

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
      name: project.name || '',
      description: project.description || '',
      project_type: project.project_type || 'scrum',
      status: project.status || 'planned',
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
    setIsEditMode(false);
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

    const projectData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      project_type: formData.project_type,
      status: formData.status,
    };

    try {
      if (isEditMode) {
        await dispatch(updateProject({ id: currentProject.id, projectData })).unwrap();
      } else {
        await dispatch(createProject(projectData)).unwrap();
      }
      closeModal();
    } catch (err) {
      handleApiError(err, setFormErrors, setServerError);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить проект? Все связанные задачи, итерации и участники будут затронуты.')) {
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
      render: (proj) => (
        <span className={`tag ${proj.project_type === 'scrum' ? 'tag-scrum' : 'tag-waterfall'}`}>
          {proj.project_type === 'scrum' ? 'Scrum' : 'Waterfall'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Статус',
      render: (proj) => {
        const statusClass = {
          planned: 'tag-planned',
          active: 'tag-active',
          completed: 'tag-completed',
        }[proj.status] || 'tag-default';
        const statusText = {
          planned: 'Планируется',
          active: 'Активен',
          completed: 'Завершён',
        }[proj.status] || proj.status;
        return <span className={`tag ${statusClass}`}>{statusText}</span>;
      }
    },
  ];

  const sortingFields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Название' },
    { key: 'project_type', label: 'Тип' },
    { key: 'status', label: 'Статус' },
    { key: 'created_at', label: 'Дата создания' },
  ];

  if (loading && currentPage === 1) {
    return <div className="page-loading">Загрузка проектов...</div>;
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Проекты</h2>
        <button onClick={() => openModal()} className="btn btn-success btn-add">
          + Добавить проект
        </button>
      </div>

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
        title={isEditMode ? 'Редактировать проект' : 'Создать проект'}
      >
        <form onSubmit={handleSubmit} className="project-form">
          {serverError && <div className="error-message">{serverError}</div>}

          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="Введите название проекта"
            />
            {formErrors.name && <span className="error-text">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              rows="5"
              placeholder="Краткое описание проекта"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Тип проекта</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                className="form-select"
              >
                <option value="scrum">Scrum</option>
                <option value="waterfall">Waterfall</option>
              </select>
            </div>

            <div className="form-group">
              <label>Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="planned">Планируется</option>
                <option value="active">Активен</option>
                <option value="completed">Завершён</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-submit">
            {isEditMode ? 'Сохранить изменения' : 'Создать проект'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;