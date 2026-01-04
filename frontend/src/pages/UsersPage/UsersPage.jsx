import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../store/slices/usersSlice';
import Modal from '../../components/Modal/Modal';
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

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка пользователей...</p>;

  return (
    <div>
      <h2>Пользователи</h2>
      <button onClick={() => openModal()}>Добавить пользователя</button>

      <div style={{ margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
        <strong>Сортировка:</strong>
        <select
          value={sortField}
          onChange={(e) => {
            setSortField(e.target.value);
            setCurrentPage(1);
          }}
          style={{ margin: '0 10px', padding: '8px', borderRadius: '4px' }}
        >
          <option value="id">ID</option>
          <option value="full_name">По имени</option>
          <option value="email">По email</option>
          <option value="created_at">По дате создания</option>
        </select>

        <select
          value={sortDirection}
          onChange={(e) => {
            setSortDirection(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          <option value="asc">По возрастанию ↑</option>
          <option value="desc">По убыванию ↓</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Полное имя</th>
            <th>Email</th>
            <th>Дата создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                Пользователей не найдено
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                <td>
                  <button onClick={() => openModal(user)}>Редактировать</button>
                  <button className="danger" onClick={() => handleDelete(user.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ padding: '10px 20px', margin: '0 10px', fontSize: '16px' }}
        >
          ← Назад
        </button>

        <span style={{ fontSize: '18px', margin: '0 30px' }}>
          Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
          <br />
          (всего <strong>{totalUsers}</strong> пользователей)
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ padding: '10px 20px', margin: '0 10px', fontSize: '16px' }}
        >
          Вперед →
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
      >
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
      </Modal>
    </div>
  );
};

export default UsersPage;