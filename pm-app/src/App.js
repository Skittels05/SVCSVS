import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import store from './store';
import ProjectList from './components/ProjectList';
import TaskList from './components/TaskList';
import MemberList from './components/MemberList';
import './locales/i18n';
import './App.css';

const Header = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="app-header">
      <h1>{t('projectManagement')}</h1>
      <div className="language-switcher">
        <button 
          onClick={() => changeLanguage('ru')}
        >
          RU
        </button>
        <button 
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
      </div>
    </header>
  );
};

const Navigation = () => {
  const { t } = useTranslation();

  return (
    <nav className="main-nav">
      <NavLink to="/projects">{t('projects')}</NavLink>
      <NavLink to="/tasks">{t('tasks')}</NavLink>
      <NavLink to="/members">{t('team')}</NavLink>
    </nav>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/members" element={<MemberList />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;