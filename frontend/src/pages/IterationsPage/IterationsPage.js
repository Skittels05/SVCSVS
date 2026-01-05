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
import './IterationsPage.css';

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

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterProject, setFilterProject] = useState('');
  const [filterType, setFilterType] = useState('');

  const [totalIterations, setTotalIterations] = useState(0);
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
    const params = {
      page: currentPage,
      limit,
      sort: `${sortField}:${sortDirection}`,
    };
    if (filterProject) params.project_id = filterProject;
    if (filterType) params.type = filterType;

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
      name: iteration.name || '',
      type: iteration.type || 'sprint',
      project_id: iteration.project_id?.toString() || '',
      start_date: iteration.start_date || '',
      end_date: iteration.end_date || '',
      status: iteration.status || 'planned',
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
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
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

    try {
      if (isEditMode) {
        await dispatch(updateIteration({ id: currentIteration.id, iterationData })).unwrap();
      } else {
        await dispatch(createIteration(iterationData)).unwrap();
      }
      closeModal();
    } catch (err) {
      handleApiError(err, setFormErrors, setServerError);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить итерацию? Это может повлиять на связанные задачи.')) {
      dispatch(deleteIteration(id));
    }
  };

  const tableColumns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Название', render: (i) => <strong>{i.name}</strong> },
    { key: 'Project', header: 'Проект', render: (i) => i.Project?.name || '—' },
    {
      key: 'type',
      header: 'Тип',
      render: (i) => (
        <span className={`tag ${i.type === 'sprint' ? 'tag-sprint' : 'tag-phase'}`}>
          {i.type === 'sprint' ? 'Спринт' : 'Фаза'}
        </span>
      )
    },
    { key: 'start_date', header: 'Начало', render: (i) => i.start_date || '—' },
    { key: 'end_date', header: 'Окончание', render: (i) => i.end_date || '—' },
    {
      key: 'status',
      header: 'Статус',
      render: (i) => {
        const statusClass = {
          planned: 'tag-planned',
          active: 'tag-active',
          completed: 'tag-completed',
        }[i.status] || 'tag-default';
        const statusText = {
          planned: 'Планируется',
          active: 'Активна',
          completed: 'Завершена',
        }[i.status] || i.status;
        return <span className={`tag ${statusClass}`}>{statusText}</span>;
      }
    },
  ];

  const sortingFields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Название' },
    { key: 'type', label: 'Тип' },
    { key: 'status', label: 'Статус' },
    { key: 'start_date', label: 'Дата начала' },
    { key: 'end_date', label: 'Дата окончания' },
    { key: 'Project.name', label: 'Проект' },
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

      <div className="filter-item">
        <label>По типу:</label>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Все типы</option>
          <option value="sprint">Спринт</option>
          <option value="phase">Фаза</option>
        </select>
      </div>
    </div>
  );

  if (loading && currentPage === 1) {
    return <div className="page-loading">Загрузка итераций...</div>;
  }

  return (
    <div className="iterations-page">
      <div className="page-header">
        <h2>Итерации и спринты</h2>
        <button onClick={() => openModal()} className="btn btn-success btn-add">
          + Добавить итерацию
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

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={isEditMode ? 'Редактировать итерацию' : 'Создать итерацию'}
      >
        <form onSubmit={handleSubmit} className="iteration-form">
          {serverError && <div className="error-message">{serverError}</div>}

          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="Например: Sprint 15"
            />
            {formErrors.name && <span className="error-text">{formErrors.name}</span>}
          </div>

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

          <div className="form-grid">
            <div className="form-group">
              <label>Тип</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form-select"
              >
                <option value="sprint">Спринт</option>
                <option value="phase">Фаза</option>
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
                <option value="active">Активна</option>
                <option value="completed">Завершена</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Дата начала</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Дата окончания</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="form-input"
              />
              {formErrors.end_date && <span className="error-text">{formErrors.end_date}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-submit">
            {isEditMode ? 'Сохранить изменения' : 'Создать итерацию'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default IterationsPage;