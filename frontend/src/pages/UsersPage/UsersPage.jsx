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

    const action = currentUser
      ? updateUser({ id: currentUser.id, userData: formData })
      : createUser(formData);

    const resultAction = await dispatch(action);

    if (resultAction.type.endsWith('/rejected')) {
      handleApiError(resultAction, setFormErrors, setServerError);
    } else {
      closeModal();
      dispatch(fetchUsers({ page: currentPage, limit, sort: `${sortField}:${sortDirection}` }));
    }
  };

  const openModal = (user = null) => {
    setCurrentUser(user);
    setFormData(
      user
        ? { full_name: user.full_name, email: user.email }
        : { full_name: '', email: '' }
    );
    setFormErrors({});
    setServerError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setFormErrors({});
    setServerError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить пользователя?')) {
      const result = await dispatch(deleteUser(id));
      if (deleteUser.fulfilled.match(result)) {
        dispatch(fetchUsers({ page: currentPage, limit, sort: `${sortField}:${sortDirection}` }));
      }
    }
  };

  const tableColumns = [
    { key: 'id', header: 'ID' },
    { key: 'full_name', header: 'Полное имя' },
    { key: 'email', header: 'Email' },
    {
      key: 'created_at',
      header: 'Дата создания',
      render: (user) => new Date(user.created_at).toLocaleDateString('ru-RU')
    },
  ];

  const sortingFields = [
    { key: 'id', label: 'ID' },
    { key: 'full_name', label: 'По имени' },
    { key: 'email', label: 'По email' },
    { key: 'created_at', label: 'По дате создания' },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortFieldChange = (field) => {
    setSortField(field);
    setCurrentPage(1);
  };

  const handleSortDirectionChange = (direction) => {
    setSortDirection(direction);
    setCurrentPage(1);
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка пользователей...</p>;

  return (
    <div>
      <h2>Пользователи</h2>
      <button 
        onClick={() => openModal()} 
        style={{
          padding: '10px 20px',
          background: '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        Добавить пользователя
      </button>

      <SortingControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={handleSortFieldChange}
        onSortDirectionChange={handleSortDirectionChange}
        availableFields={sortingFields}
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
        onPageChange={handlePageChange}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
      >
        <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
          <form onSubmit={handleSubmit}>
            {serverError && (
              <p style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>
                {serverError}
              </p>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Полное имя</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              {formErrors.full_name && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.full_name}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              {formErrors.email && <p style={{ color: 'red', marginTop: '5px' }}>{formErrors.email}</p>}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {currentUser ? 'Сохранить изменения' : 'Добавить пользователя'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;