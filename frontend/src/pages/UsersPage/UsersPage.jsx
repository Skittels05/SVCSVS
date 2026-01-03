import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../store/slices/usersSlice';
import Modal from '../../components/Modal/Modal';

const UsersPage = () => {
  const dispatch = useDispatch();
  const { list: users, loading, error } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

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

    if (currentUser) {
      await dispatch(updateUser({ id: currentUser.id, userData: formData }));
    } else {
      await dispatch(createUser(formData));
    }
    closeModal();
  };

  const openModal = (user = null) => {
    setCurrentUser(user);
    setFormData(user ? { full_name: user.full_name, email: user.email } : { full_name: '', email: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить пользователя?')) {
      dispatch(deleteUser(id));
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>;

  return (
    <div>
      <h2>Пользователи</h2>
      <button onClick={() => openModal()}>Добавить пользователя</button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Полное имя</th>
            <th>Email</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => openModal(user)}>Редактировать</button>
                <button className="danger" onClick={() => handleDelete(user.id)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentUser ? 'Редактировать пользователя' : 'Добавить пользователя'}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Полное имя</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            {formErrors.full_name && <p style={{ color: 'red' }}>{formErrors.full_name}</p>}
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {formErrors.email && <p style={{ color: 'red' }}>{formErrors.email}</p>}
          </div>
          <button type="submit">{currentUser ? 'Сохранить' : 'Добавить'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;