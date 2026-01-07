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
  const { user: currentUser } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserEdit, setCurrentUserEdit] = useState(null);
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

  const canManageUser = (user) => {
    if (!currentUser) return false;
    if (currentUser.rights === 'admin') return true;
    return user.id === currentUser.id;
  };

  const canAddUser = () => {
    if (!currentUser) return false;
    return currentUser.rights === 'admin';
  };

  const openModal = (user = null) => {
    if (user && !canManageUser(user)) {
      alert('У вас нет прав на редактирование этого пользователя');
      return;
    }
    setCurrentUserEdit(user);
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
    setCurrentUserEdit(null);
  };

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
      if (currentUserEdit) {
        if (!canManageUser(currentUserEdit)) {
          setServerError('У вас нет прав на редактирование этого пользователя');
          return;
        }
        await dispatch(updateUser({ id: currentUserEdit.id, userData })).unwrap();
      } else {
        if (!canAddUser()) {
          setServerError('Только администратор может добавлять пользователей');
          return;
        }
        await dispatch(createUser(userData)).unwrap();
      }
      closeModal();
    } catch (err) {
      handleApiError(err, setFormErrors, setServerError);
    }
  };

  const handleDelete = (id) => {
    const userToDelete = users.find(u => u.id === id);
    if (!canManageUser(userToDelete)) {
      alert('У вас нет прав на удаление этого пользователя');
      return;
    }
    if (window.confirm('Удалить пользователя? Это может повлиять на связанные задачи и проекты.')) {
      dispatch(deleteUser(id)).unwrap().then(() => {
        dispatch(fetchUsers({ page: currentPage, limit }));
      });
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

  const customActions = (user) => {
    const canManage = canManageUser(user);

    return (
      <div className="table-actions">
        <button
          onClick={() => openModal(user)}
          className="btn btn-primary btn-small"
          disabled={!canManage}
          title={!canManage ? 'Нет прав на редактирование' : ''}
        >
          Редактировать
        </button>

        <button
          onClick={() => handleDelete(user.id)}
          className="btn btn-danger btn-small"
          disabled={!canManage}
          title={!canManage ? 'Нет прав на удаление' : ''}
        >
          Удалить
        </button>
      </div>
    );
  };

  if (loading && currentPage === 1) {
    return <div className="page-loading">Загрузка пользователей...</div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>Пользователи</h2>
        <button
          onClick={() => openModal()}
          className="btn btn-success btn-add"
          disabled={!canAddUser()}
          title={!canAddUser() ? 'Только администратор может добавлять пользователей' : ''}
        >
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
        customActions={customActions}
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
        title={currentUserEdit ? 'Редактировать пользователя' : 'Добавить пользователя'}
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
            {currentUserEdit ? 'Сохранить изменения' : 'Добавить пользователя'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;