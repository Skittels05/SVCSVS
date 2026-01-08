import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { fetchProjects } from '../../store/slices/projectsSlice';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import './AnalyticsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { list: tasks } = useSelector((state) => state.tasks);
  const { list: projects } = useSelector((state) => state.projects);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await dispatch(fetchTasks({ limit: 10000, page: 1 }));
        await dispatch(fetchProjects({ limit: 10000, page: 1 }));
      } catch (err) {
        console.error('Ошибка загрузки данных для аналитики:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  const filteredTasks = tasks.filter(task => {
    let matches = true;
    if (selectedProject) matches &= task.project_id === parseInt(selectedProject);
    if (selectedMonth) {
      const taskDate = new Date(task.created_at);
      matches &= `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    }
    return matches;
  });

  const pieData = {
    labels: ['Бэклог', 'To Do', 'В работе', 'На проверке', 'Готово'],
    datasets: [{
      data: [
        filteredTasks.filter(t => t.status === 'backlog').length,
        filteredTasks.filter(t => t.status === 'todo').length,
        filteredTasks.filter(t => t.status === 'in_progress').length,
        filteredTasks.filter(t => t.status === 'review').length,
        filteredTasks.filter(t => t.status === 'done').length,
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
      title: { display: true, text: 'Распределение задач по статусам' },
    },
  };

  const months = [...new Set(tasks.map(t => new Date(t.created_at).toISOString().slice(0, 7)))].sort();
  const lineData = {
    labels: months,
    datasets: projects.slice(0, 3).map((proj, idx) => ({
      label: proj.name,
      data: months.map(month => 
        tasks.filter(t => t.project_id === proj.id && new Date(t.created_at).toISOString().slice(0, 7) === month).length
      ),
      borderColor: ['#FF6384', '#36A2EB', '#FFCE56'][idx],
      fill: false,
    })),
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
      title: { display: true, text: 'Динамика создания задач по месяцам' },
    },
    scales: {
      x: { title: { display: true, text: 'Месяц' } },
      y: { title: { display: true, text: 'Количество задач' } },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  const priorities = ['low', 'medium', 'high', 'critical'];
  const barData = {
    labels: priorities.map(p => ({ low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' }[p])),
    datasets: [{
      label: 'Количество задач',
      data: priorities.map(p => filteredTasks.filter(t => t.priority === p).length),
      backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#FF0000'],
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
      title: { display: true, text: 'Топ задач по приоритету' },
    },
    scales: {
      x: { title: { display: true, text: 'Приоритет' } },
      y: { title: { display: true, text: 'Количество' } },
    },
  };

  if (loading) return <div>Загрузка аналитики...</div>;

  return (
    <div className="analytics-page">
      <h2>Аналитика задач</h2>

      <div className="filters">
        <label>Фильтр по проекту:</label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
          <option value="">Все</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label>Фильтр по месяцу:</label>
        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
      </div>

      <div className="charts">
        <div className="chart-container">
          <Pie data={pieData} options={pieOptions} />
        </div>

        <div className="chart-container">
          <Line data={lineData} options={lineOptions} />
        </div>

        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;