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
import './AttachmentsPage.css';

const AttachmentsPage = () => {
  const dispatch = useDispatch();
  const { list: attachments, loading } = useSelector((state) => state.attachments);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({ task_id: '', file_name: '' });
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
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert('Максимум 10 файлов за раз');
      return;
    }
    setSelectedFiles(files);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.task_id) errors.task_id = 'Выберите задачу';
    if (!isEditMode && selectedFiles.length === 0) errors.files = 'Выберите хотя бы одно изображение';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setServerError('');
    setFormErrors({});

    try {
      if (isEditMode) {
        await dispatch(updateAttachment({
          id: currentAttachment.id,
          attachmentData: {
            task_id: parseInt(formData.task_id),
            file_name: formData.file_name.trim(),
          },
        })).unwrap();
      } else {
        const form = new FormData();
        selectedFiles.forEach((file) => form.append('files', file));
        form.append('task_id', formData.task_id);
        form.append('user_id', 1);

        await dispatch(createAttachments(form)).unwrap();
      }
      closeModal();
    } catch (err) {
      handleApiError(err, setFormErrors, setServerError);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить изображение? Файл будет безвозвратно удалён.')) {
      dispatch(deleteAttachment(id));
    }
  };

  const tableColumns = [
    { key: 'id', header: 'ID' },
    {
      key: 'file_url',
      header: 'Превью',
      render: (att) => {
        const fullUrl = `http://localhost:5000${att.file_url}`;
        return (
          <div className="attachment-preview">
            <img src={fullUrl} alt={att.file_name} onError={(e) => (e.target.src = '/placeholder.png')} />
          </div>
        );
      },
    },
    { key: 'file_name', header: 'Имя файла' },
    { key: 'Task', header: 'Задача', render: (att) => att.Task?.title || '—' },
    { key: 'Uploader', header: 'Загрузил', render: (att) => att.Uploader?.full_name || '—' },
    { key: 'created_at', header: 'Дата загрузки', render: (att) => new Date(att.created_at).toLocaleString('ru-RU') },
  ];

  const sortingFields = [
    { key: 'id', label: 'ID' },
    { key: 'file_name', label: 'Имя файла' },
    { key: 'Task.title', label: 'Название задачи' },
    { key: 'Uploader.full_name', label: 'Имя пользователя' },
    { key: 'created_at', label: 'Дата загрузки' },
  ];

  const additionalFilters = () => (
    <div className="filter-group">
      <div className="filter-item">
        <label>По задаче:</label>
        <select value={filterTask} onChange={(e) => { setFilterTask(e.target.value); setCurrentPage(1); }}>
          <option value="">Все задачи</option>
          {loadingTasks ? <option disabled>Загрузка...</option> : tasks.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label>По пользователю:</label>
        <select value={filterUser} onChange={(e) => { setFilterUser(e.target.value); setCurrentPage(1); }}>
          <option value="">Все пользователи</option>
          {loadingUsers ? <option disabled>Загрузка...</option> : users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading && currentPage === 1) {
    return <div className="page-loading">Загрузка вложений...</div>;
  }

  return (
    <div className="attachments-page">
      <div className="page-header">
        <h2>Вложения (изображения)</h2>
        <button onClick={() => openModal()} className="btn btn-success btn-add">
          + Добавить изображения
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
        data={attachments}
        columns={tableColumns}
        emptyMessage="Вложений не найдено"
        onEdit={openModal}
        onDelete={handleDelete}
        onView={(att) => window.open(`http://localhost:5000${att.file_url}`, '_blank')}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalAttachments}
        pageSize={limit}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      <Modal isOpen={modalOpen} onClose={closeModal} title={isEditMode ? 'Редактировать вложение' : 'Загрузить изображения'}>
        <form onSubmit={handleSubmit} className="attachment-form">
          {serverError && <div className="error-message">{serverError}</div>}

          <div className="form-group">
            <label>Задача *</label>
            <select
              value={formData.task_id}
              onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
              className="form-select large-select"
              disabled={loadingTasks}
            >
              <option value="">Выберите задачу</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
            {formErrors.task_id && <span className="error-text">{formErrors.task_id}</span>}
          </div>

          {!isEditMode && (
            <div className="form-group">
              <label>Изображения (до 10) *</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="form-file-input"
              />
              {selectedFiles.length > 0 && <p className="file-info">Выбрано файлов: {selectedFiles.length}</p>}
              {formErrors.files && <span className="error-text">{formErrors.files}</span>}
            </div>
          )}

          {isEditMode && (
            <>
              <div className="form-group">
                <label>Имя файла</label>
                <input
                  type="text"
                  value={formData.file_name}
                  onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                  className="form-input"
                />
              </div>

              {currentAttachment && (
                <div className="preview-large">
                  <img
                    src={`http://localhost:5000${currentAttachment.file_url}`}
                    alt={currentAttachment.file_name}
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary btn-submit">
            {isEditMode ? 'Сохранить изменения' : 'Загрузить изображения'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AttachmentsPage;