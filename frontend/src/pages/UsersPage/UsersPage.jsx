import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../store/slices/usersSlice';
import Modal from '../../components/Modal/Modal';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SortingControls from '../../components/SortingControls/SortingControls';
import { handleApiError } from '../../utils/handleApiError';
import './UsersPage.css';

const UsersPage = () => {
  const dispatch = useDispatch();
  const { list: users, loading } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    dispatch(
      fetchUsers({
        page: currentPage,
        limit,
        sort: `${sortField}:${sortDirection}`,
      })
    )
      .unwrap()
      .then((payload) => {
        setTotalUsers(payload.total || 0);
        setTotalPages(payload.pages || 1);
      })
      .catch((err) => {
        console.error('Ошибка загрузки пользователей:', err);
      });
  }, [dispatch, currentPage, sortField, sortDirection]);

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Полное имя обязательно';
    if (!formData.email.trim()) errors.email = 'Email обязателен';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Некорректный email';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setServerError('');
    setFormErrors({});

    const userData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
    };

    try {
      if (currentUser) {
        await dispatch(updateUser({ id: currentUser.id, userData })).unwrap();
      } else {
        await dispatch(createUser(userData)).unwrap();
      }
      closeModal();
    } catch (err) {
      handleApiError(err, setFormErrors, setServerError);
    }
  };

  const openModal = (user = null) => {
    setCurrentUser(user);
    setFormData(
      user
        ? { full_name: user.full_name || '', email: user.email || '' }
        : { full_name: '', email: '' }
    );
    setFormErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить пользователя? Это может повлиять на связанные задачи и проекты.')) {
      const result = await dispatch(deleteUser(id));
      if (deleteUser.fulfilled.match(result)) {
        dispatch(fetchUsers({ page: currentPage, limit }));
      }
    }
  };

  const tableColumns = [
    { key: 'id', header: 'ID' },
    { key: 'full_name', header: 'Полное имя', render: (u) => <strong>{u.full_name}</strong> },
    { key: 'email', header: 'Email', render: (u) => <a href={`mailto:${u.email}`}>{u.email}</a> },
    {
      key: 'created_at',
      header: 'Дата регистрации',
      render: (u) => new Date(u.created_at).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
  ];

  const sortingFields = [
    { key: 'id', label: 'ID' },
    { key: 'full_name', label: 'Имя' },
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Дата создания' },
  ];

  if (loading && currentPage === 1) {
    return <div className="page-loading">Загрузка пользователей...</div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>Пользователи</h2>
        <button onClick={() => openModal()} className="btn btn-success btn-add">
          + Добавить пользователя
        </button>
      </div>

      <SortingControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={(f) => { setSortField(f); setCurrentPage(1); }}
        onSortDirectionChange={(d) => { setSortDirection(d); setCurrentPage(1); }}
        availableFields={sortingFields}
        title="Сортировка"
      />

      <DataTable
        data={users}
        columns={tableColumns}
        emptyMessage="Пользователей не найдено"
        onEdit={openModal}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalUsers}
        pageSize={limit}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
      >
        <form onSubmit={handleSubmit} className="user-form">
          {serverError && <div className="error-message">{serverError}</div>}

          <div className="form-group">
            <label>Полное имя *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="form-input"
              placeholder="Иванов Иван Иванович"
            />
            {formErrors.full_name && <span className="error-text">{formErrors.full_name}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder="user@example.com"
            />
            {formErrors.email && <span className="error-text">{formErrors.email}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-submit">
            {currentUser ? 'Сохранить изменения' : 'Добавить пользователя'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;