import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Header.css';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <h1 className="header-title">
          <Link to="/" className="header-logo">
            Система управления проектами
          </Link>
        </h1>

        <input type="checkbox" id="nav-toggle" className="nav-toggle" />
        <label htmlFor="nav-toggle" className="nav-toggle-label">
          <span></span>
          <span></span>
          <span></span>
        </label>

        <nav className="header-nav">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/projects" className="nav-link">Проекты</Link>
          <Link to="/tasks" className="nav-link">Задачи</Link>
          <Link to="/users" className="nav-link">Пользователи</Link>
          <Link to="/project-members" className="nav-link">Участники</Link>
          <Link to="/attachments" className="nav-link">Вложения</Link>
          <Link to="/iterations" className="nav-link">Итерации</Link>
          <Link to="/analytics" className="nav-link">Аналитика</Link>
          <Link to="/kanban" className="nav-link">Канбан-доска</Link>
        </nav>

        {user && (
          <div className="user-info">
            <div className="user-greeting">
              <span className="user-name">Привет, {user.full_name}</span>
              {user.rights === 'admin' && <span className="admin-badge">Админ</span>}
            </div>
            <button onClick={handleLogout} className="btn btn-logout">
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;