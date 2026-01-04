import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage/HomePage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import TasksPage from './pages/TasksPage/TasksPage';
import UsersPage from './pages/UsersPage/UsersPage';
import ProjectMembersPage from './pages/ProjectMembersPage/ProjectMembersPage';
import AttachmentsPage from './pages/AttachmentsPage/AttachmentsPage';
import IterationsPage from './pages/IterationsPage/IterationsPage';

function App() {
  return (
    <div>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path='/project-members' element={<ProjectMembersPage/>} />
          <Route path='/attachments' element={<AttachmentsPage/>} />
          <Route path='/iterations' element={<IterationsPage/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;