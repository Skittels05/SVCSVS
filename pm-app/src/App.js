import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import store from './store';
import ProjectList from './components/ProjectList/ProjectList';
import TaskList from './components/TaskList/TaskList';
import MemberList from './components/MemberList/MemberList';
import Header from './components/Header/Header'; // Импортируем новый компонент
import './locales/i18n';
import './App.css';

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