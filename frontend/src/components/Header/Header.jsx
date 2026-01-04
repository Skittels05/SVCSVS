import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ background: '#2c3e50', color: 'white', padding: '15px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Система управления проектами</h1>
        <nav>
          <Link to="/" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Главная</Link>
          <Link to="/projects" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Проекты</Link>
          <Link to="/tasks" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Задачи</Link>
          <Link to="/users" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Пользователи</Link>
          <Link to="/project-members" style={{ color: 'white', margin: '0 15px', textDecoration: 'none' }}>Учсатники</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;