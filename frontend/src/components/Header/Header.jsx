import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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
        </nav>
      </div>
    </header>
  );
};

export default Header;