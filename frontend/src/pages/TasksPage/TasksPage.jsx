import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadAttachments,
  deleteAttachment,
} from '../../store/slices/tasksSlice';
import Modal from '../../components/Modal/Modal';
import EditableTable from '../../components/EditableTable/EditableTable';
import './TasksPage.css';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { handleApiError } from '../../utils/handleApiError';
import * as XLSX from 'xlsx';

let pdfMake;
try {
  pdfMake = require('pdfmake/build/pdfmake');
  const pdfFonts = require('pdfmake/build/vfs_fonts');
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }
} catch (error) {
  console.warn('PDFMake не загружен, экспорт в PDF будет недоступен:', error);
}

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Заголовок обязателен'),
  description: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']),
  story_points: z
    .number({ invalid_type_error: 'Должно быть числом' })
    .int()
    .min(1, 'Story points должно быть не менее 1')
    .max(21, 'Story points не более 21')
    .optional()
    .nullable(),
  due_date: z.string().optional().nullable(),
  project_id: z.number().int().min(1, 'Выберите проект'),
  iteration_id: z.number().int().optional().nullable(),
  assignee_id: z.number().int().optional().nullable(),
  reporter_id: z.number().int().optional().nullable(),
});

const TasksPage = () => {
  const dispatch = useDispatch();
  const { list: tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [modalTask, setModalTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [serverError, setServerError] = useState('');

  const [projects, setProjects] = useState([]);
  const [iterations, setIterations] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingIterations, setLoadingIterations] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; 

  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tableFilters, setTableFilters] = useState({
    status: '',
    priority: '',
    project: '',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      story_points: null,
      due_date: '',
      project_id: null,
      iteration_id: null,
      assignee_id: null,
      reporter_id: null,
    },
  });

  const watchedProjectId = useWatch({ control, name: 'project_id' });

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await api.get('/projects?limit=1000');
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (watchedProjectId) {
      const loadIterations = async () => {
        setLoadingIterations(true);
        try {
          const response = await api.get(`/iterations?project_id=${watchedProjectId}&limit=100`);
          setIterations(response.data.data || []);
        } catch (err) {
          console.error('Ошибка загрузки итераций:', err);
          setIterations([]);
        } finally {
          setLoadingIterations(false);
        }
      };
      loadIterations();

      const loadMembers = async () => {
        setLoadingMembers(true);
        try {
          const response = await api.get(`/projects/${watchedProjectId}/members`);
          setProjectMembers(response.data || []);
        } catch (err) {
          console.error('Ошибка загрузки участников:', err);
          setProjectMembers([]);
        } finally {
          setLoadingMembers(false);
        }
      };
      loadMembers();
    } else {
      setIterations([]);
      setProjectMembers([]);
    }
  }, [watchedProjectId]);

  useEffect(() => {
    const loadTasks = async () => {
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (tableFilters.project)   params.projectId = tableFilters.project;
      if (tableFilters.status)    params.status    = tableFilters.status;
      if (tableFilters.priority)  params.priority  = tableFilters.priority;

      try {
        const result = await dispatch(fetchTasks(params)).unwrap();
        setTotalTasks(result.total || 0);
        setTotalPages(result.pages || 1);
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
      }
    };

    loadTasks();
  }, [dispatch, currentPage, tableFilters]);

  const handleTableFilterChange = (filterType, value) => {
    if (filterType === 'reset') {
      setTableFilters({ status: '', priority: '', project: '' });
    } else {
      setTableFilters((prev) => ({ ...prev, [filterType]: value }));
    }
    setCurrentPage(1);
  };

  const handleStatusEdit = async (taskId, field, newValue) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (!canEditOrDeleteTask(task)) {
        alert('У вас нет прав на редактирование этой задачи');
        return;
      }

      const taskData = { [field]: newValue };
      await dispatch(updateTask({ id: taskId, taskData })).unwrap();

      showNotification(`Статус задачи обновлен на: ${getStatusLabel(newValue)}`);
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      alert('Не удалось обновить статус задачи');
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      backlog: 'Бэклог',
      todo: 'To Do',
      in_progress: 'В работе',
      review: 'На проверке',
      done: 'Готово',
    };
    return statusMap[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const priorityMap = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      critical: 'Критический',
    };
    return priorityMap[priority] || priority;
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'status-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #27ae60 0%, #219653 100%);
      color: white;
      padding: 14px 28px;
      border-radius: 10px;
      box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
      z-index: 1000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
      border-left: 5px solid #1e8449;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const canEditOrDeleteTask = (task) => {
    if (!currentUser) return false;
    if (currentUser.rights === 'admin') return true;

    const reporterId = task?.reporter_id ?? task?.Reporter?.id ?? null;
    const assigneeId = task?.assignee_id ?? task?.Assignee?.id ?? null;
    const projectCreatorId = task?.Project?.creator_id ?? task?.Project?.Creator?.id ?? null;

    return (
      reporterId === currentUser.id ||
      assigneeId === currentUser.id ||
      projectCreatorId === currentUser.id
    );
  };

  const canDeleteAttachment = (attachment) => {
    if (!currentUser) return false;
    if (currentUser.rights === 'admin') return true;
    return attachment?.Uploader?.id === currentUser.id;
  };

  const openTaskModal = (task = null, edit = false) => {
    if (task && edit && !canEditOrDeleteTask(task)) {
      alert('У вас нет прав на редактирование этой задачи');
      return;
    }

    setModalTask(task);
    setIsEditMode(edit || !task);
    setSelectedFiles([]);
    setServerError('');
    setIsModalOpen(true);

    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        story_points: task.story_points || null,
        due_date: task.due_date || '',
        project_id: task.project_id || null,
        iteration_id: task.iteration_id || null,
        assignee_id: task.assignee_id || null,
        reporter_id: task.reporter_id || null,
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        story_points: null,
        due_date: '',
        project_id: null,
        iteration_id: null,
        assignee_id: null,
        reporter_id: null,
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTask(null);
    setIsEditMode(false);
    setIterations([]);
    setProjectMembers([]);
    reset();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExportPDF = async () => {
    const params = {
      page: 1,
      limit: 10000,
    };
    if (tableFilters.project) params.projectId = tableFilters.project;
    if (tableFilters.status) params.status = tableFilters.status;
    if (tableFilters.priority) params.priority = tableFilters.priority;

    try {
      const result = await dispatch(fetchTasks(params)).unwrap();
      const dataToExport = result.data || [];

      const statusMap = {
        backlog: 'Бэклог',
        todo: 'To Do',
        in_progress: 'В работе',
        review: 'На проверке',
        done: 'Готово',
      };

      const priorityMap = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий',
        critical: 'Критический',
      };

      const groupedTasks = dataToExport.reduce((acc, task) => {
        const status = task.status || 'unknown';
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
      }, {});

      const content = [
        { text: 'Отчет по задачам', style: 'header', margin: [0, 0, 0, 20] },
        { text: `Дата отчета: ${new Date().toLocaleDateString('ru-RU')}`, margin: [0, 0, 0, 8] },
        { text: `Пользователь: ${currentUser?.full_name || 'Неизвестно'}`, margin: [0, 0, 0, 8] },
        { text: `Всего задач в отчете: ${dataToExport.length}`, margin: [0, 0, 0, 20] },
      ];

      if (tableFilters.project) {
        const projectName = projects.find((p) => p.id === parseInt(tableFilters.project))?.name || `ID ${tableFilters.project}`;
        content.push({ text: `Фильтр по проекту: ${projectName}`, margin: [0, 0, 0, 8] });
      }
      if (tableFilters.status) {
        const statusName = statusMap[tableFilters.status] || tableFilters.status;
        content.push({ text: `Фильтр по статусу: ${statusName}`, margin: [0, 0, 0, 8] });
      }
      if (tableFilters.priority) {
        const priorityName = priorityMap[tableFilters.priority] || tableFilters.priority;
        content.push({ text: `Фильтр по приоритету: ${priorityName}`, margin: [0, 0, 0, 8] });
      }

      Object.entries(groupedTasks)
        .sort(([a], [b]) => {
          const order = ['backlog', 'todo', 'in_progress', 'review', 'done'];
          return order.indexOf(a) - order.indexOf(b);
        })
        .forEach(([status, groupTasks]) => {
          const statusName = statusMap[status] || status;
          const totalPoints = groupTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);

          const tableBody = [
            ['ID', 'Название', 'Проект', 'Приоритет', 'Story Points', 'Исполнитель', 'Срок'],
          ];

          groupTasks.forEach((task) => {
            tableBody.push([
              task.id.toString(),
              task.title || '—',
              task.Project?.name || '—',
              priorityMap[task.priority] || task.priority || '—',
              task.story_points?.toString() || '—',
              task.Assignee?.full_name || '—',
              task.due_date ? new Date(task.due_date).toLocaleDateString('ru-RU') : '—',
            ]);
          });

          content.push(
            { text: `Группа: ${statusName} (${groupTasks.length} задач)`, style: 'subheader' },
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: tableBody,
              },
              layout: 'lightHorizontalLines',
              margin: [0, 10, 0, 10],
            },
            { text: `Итого story points: ${totalPoints}`, style: 'total', margin: [0, 0, 0, 20] },
          );
        });

      const docDefinition = {
        content,
        styles: {
          header: { fontSize: 18, bold: true, color: '#2c3e50' },
          subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
          total: { fontSize: 12, bold: true, color: '#27ae60' },
        },
        defaultStyle: {
          fontSize: 11,
          color: '#34495e',
        },
      };

      pdfMake.createPdf(docDefinition).download('otchet_po_zadacham.pdf');
    } catch (err) {
      console.error('Ошибка экспорта PDF:', err);
      alert('Не удалось загрузить данные для экспорта.');
    }
  };

  const handleExportExcel = async () => {
    const params = {
      page: 1,
      limit: 10000,
    };
    if (tableFilters.project) params.projectId = tableFilters.project;
    if (tableFilters.status) params.status = tableFilters.status;
    if (tableFilters.priority) params.priority = tableFilters.priority;

    try {
      const result = await dispatch(fetchTasks(params)).unwrap();
      const dataToExport = result.data || [];

      const wb = XLSX.utils.book_new();

      const title = [['Отчет по задачам']];
      const info = [
        ['Дата отчета:', new Date().toLocaleDateString('ru-RU')],
        ['Пользователь:', currentUser?.full_name || 'Неизвестно'],
        ['Всего задач в отчете:', dataToExport.length],
      ];

      if (tableFilters.project) {
        const projectName = projects.find((p) => p.id === parseInt(tableFilters.project))?.name || `ID ${tableFilters.project}`;
        info.push(['Фильтр по проекту:', projectName]);
      }
      if (tableFilters.status) {
        const statusName = {
          backlog: 'Бэклог',
          todo: 'To Do',
          in_progress: 'В работе',
          review: 'На проверке',
          done: 'Готово',
        }[tableFilters.status] || tableFilters.status;
        info.push(['Фильтр по статусу:', statusName]);
      }
      if (tableFilters.priority) {
        const priorityName = {
          low: 'Низкий',
          medium: 'Средний',
          high: 'Высокий',
          critical: 'Критический',
        }[tableFilters.priority] || tableFilters.priority;
        info.push(['Фильтр по приоритету:', priorityName]);
      }

      info.push([]);

      const statusMap = {
        backlog: 'Бэклог',
        todo: 'To Do',
        in_progress: 'В работе',
        review: 'На проверке',
        done: 'Готово',
      };
      const priorityMap = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий',
        critical: 'Критический',
      };

      const groupedTasks = dataToExport.reduce((acc, task) => {
        const status = task.status || 'unknown';
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
      }, {});

      let allRows = [...title, ...info];

      Object.entries(groupedTasks)
        .sort(([a], [b]) => {
          const order = ['backlog', 'todo', 'in_progress', 'review', 'done'];
          return order.indexOf(a) - order.indexOf(b);
        })
        .forEach(([status, groupTasks]) => {
          const statusName = statusMap[status] || status;
          let totalPoints = 0;

          allRows.push([`Группа: ${statusName} (Задач: ${groupTasks.length})`]);
          allRows.push(['ID', 'Название', 'Проект', 'Приоритет', 'Story Points', 'Исполнитель', 'Срок']);

          groupTasks.forEach((task) => {
            totalPoints += task.story_points || 0;
            allRows.push([
              task.id,
              task.title || '—',
              task.Project?.name || '—',
              priorityMap[task.priority] || task.priority || '—',
              task.story_points || '—',
              task.Assignee?.full_name || '—',
              task.due_date ? new Date(task.due_date).toLocaleDateString('ru-RU') : '—',
            ]);
          });

          allRows.push(['Итого story points:', totalPoints]);
          allRows.push([]);
        });

      const ws = XLSX.utils.aoa_to_sheet(allRows);

      ws['!cols'] = [
        { wch: 8 },
        { wch: 50 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Задачи');
      XLSX.writeFile(wb, 'otchet_po_zadacham.xlsx');
    } catch (err) {
      console.error('Ошибка экспорта Excel:', err);
      alert('Не удалось загрузить данные для экспорта.');
    }
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      meta: { width: '80px' },
    },
    {
      key: 'title',
      header: 'Название',
      render: (t) => <strong>{t.title}</strong>,
      meta: { width: '300px' },
    },
    {
      key: 'Project.name',
      header: 'Проект',
      render: (t) => t.Project?.name || '—',
      meta: { width: '180px' },
    },
    {
      key: 'Iteration.name',
      header: 'Итерация',
      render: (t) => t.Iteration?.name || '—',
      meta: { width: '150px' },
    },
    {
      key: 'priority',
      header: 'Приоритет',
      render: (t) => (
        <span className={`priority-tag priority-${t.priority}`}>
          {getPriorityLabel(t.priority)}
        </span>
      ),
      meta: { width: '140px' },
    },
    {
      key: 'status',
      header: 'Статус',
      render: (t) => (
        <span className={`status-tag status-${t.status}`}>
          {getStatusLabel(t.status)}
        </span>
      ),
      meta: { width: '140px' },
    },
    {
      key: 'Assignee.full_name',
      header: 'Исполнитель',
      render: (t) => t.Assignee?.full_name || '—',
      meta: { width: '180px' },
    },
    {
      key: 'due_date',
      header: 'Срок',
      render: (t) => (t.due_date ? new Date(t.due_date).toLocaleDateString('ru-RU') : '—'),
      meta: { width: '120px' },
    },
    {
      key: 'actions',
      header: 'Действия',
      render: (task) => {
        const canManage = canEditOrDeleteTask(task);
        return (
          <div className="table-actions">
            <button
              onClick={() => openTaskModal(task, false)}
              className="btn btn-info btn-small"
              title="Просмотреть"
            >
              👁️
            </button>
            <button
              onClick={() => openTaskModal(task, true)}
              className="btn btn-primary btn-small"
              disabled={!canManage}
              title={!canManage ? 'Нет прав на редактирование' : 'Редактировать'}
            >
              ✏️
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              className="btn btn-danger btn-small"
              disabled={!canManage}
              title={!canManage ? 'Нет прав на удаление' : 'Удалить'}
            >
              🗑️
            </button>
          </div>
        );
      },
      meta: { width: '180px' },
    },
  ];

  const handleDelete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!canEditOrDeleteTask(task)) {
      alert('У вас нет прав на удаление этой задачи');
      return;
    }
    if (window.confirm('Удалить задачу? Все вложения будут удалены безвозвратно.')) {
      dispatch(deleteTask(id));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert('Максимум 10 изображений');
      return;
    }
    setSelectedFiles(files);
  };

  const onSubmit = async (data) => {
    setServerError('');

    const taskData = {
      ...data,
      story_points: data.story_points || null,
      due_date: data.due_date || null,
      iteration_id: data.iteration_id || null,
      assignee_id: data.assignee_id || null,
      reporter_id: data.reporter_id || null,
    };

    try {
      let newTask;
      if (modalTask) {
        await dispatch(updateTask({ id: modalTask.id, taskData })).unwrap();
        newTask = { ...modalTask, ...taskData };
      } else {
        const result = await dispatch(createTask(taskData)).unwrap();
        newTask = result;
      }

      if (selectedFiles.length > 0) {
        await dispatch(
          uploadAttachments({
            taskId: newTask.id,
            files: selectedFiles,
            userId: currentUser.id,
          })
        );
      }

      closeModal();
    } catch (err) {
      handleApiError(err, (fieldErrors) => {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });
      }, setServerError);
    }
  };

  const handleDeleteAttachment = (attachmentId) => {
    const attachment = modalTask?.Attachments?.find((a) => a.id === attachmentId);
    if (!canDeleteAttachment(attachment)) {
      alert('У вас нет прав на удаление этого вложения');
      return;
    }
    if (window.confirm('Удалить изображение?')) {
      dispatch(deleteAttachment({ attachmentId, taskId: modalTask.id }));
      setModalTask((prev) => ({
        ...prev,
        Attachments: prev.Attachments.filter((a) => a.id !== attachmentId),
      }));
    }
  };

  if (tasksLoading && currentPage === 1) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка задач...</p>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h2>Задачи</h2>
        <div className="header-actions">
          <div className="export-buttons">
            <button onClick={handleExportPDF} className="btn btn-pdf">
              📄 Экспорт в PDF
            </button>
            <button onClick={handleExportExcel} className="btn btn-excel">
              📊 Экспорт в Excel
            </button>
          </div>
          <button onClick={() => openTaskModal()} className="btn btn-success btn-add">
            <span>+</span> Создать задачу
          </button>
        </div>
      </div>


      <EditableTable
        data={tasks}
        columns={tableColumns}
        onEditCell={handleStatusEdit}
        emptyMessage="Задачи не найдены. Попробуйте изменить фильтры в заголовках таблицы или создать новую задачу."
        pageSize={pageSize}
        totalCount={totalTasks}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={tasksLoading}
        projects={projects}
        filters={tableFilters}
        onFilterChange={handleTableFilterChange}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? (modalTask ? 'Редактировать задачу' : 'Создать задачу') : 'Просмотр задачи'}
        size="large"
      >
        <div className="task-modal-content">
          {isEditMode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="task-form">
              {serverError && <div className="error-message">{serverError}</div>}

              <div className="form-group">
                <label>Заголовок *</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      className="form-input"
                      placeholder="Краткое название задачи"
                    />
                  )}
                />
                {errors.title && <span className="error-text">{errors.title.message}</span>}
              </div>

              <div className="form-group">
                <label>Описание</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className="form-textarea"
                      rows="5"
                      placeholder="Подробное описание"
                    />
                  )}
                />
              </div>

              <div className="form-group">
                <label>Проект *</label>
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value) : null;
                        field.onChange(val);
                        setValue('iteration_id', null);
                        setValue('assignee_id', null);
                        setValue('reporter_id', null);
                      }}
                      className="form-select"
                      disabled={loadingProjects}
                    >
                      <option value="">Выберите проект</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.project_id && <span className="error-text">{errors.project_id.message}</span>}
              </div>

              <div className="form-group">
                <label>Итерация</label>
                <Controller
                  name="iteration_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="form-select large-select"
                      disabled={!watchedProjectId || loadingIterations}
                    >
                      <option value="">— Без итерации —</option>
                      {iterations.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.type})
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Исполнитель</label>
                  <Controller
                    name="assignee_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        className="form-select large-select"
                        disabled={!watchedProjectId || loadingMembers}
                      >
                        <option value="">— Не назначен —</option>
                        {projectMembers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div className="form-group">
                  <label>Репортер</label>
                  <Controller
                    name="reporter_id"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        className="form-select large-select"
                        disabled={!watchedProjectId || loadingMembers}
                      >
                        <option value="">— Не назначен —</option>
                        {projectMembers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Приоритет</label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="form-select">
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                        <option value="critical">Критический</option>
                      </select>
                    )}
                  />
                </div>

                <div className="form-group">
                  <label>Статус</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="form-select">
                        <option value="backlog">Бэклог</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">В работе</option>
                        <option value="review">На проверке</option>
                        <option value="done">Готово</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Story Points</label>
                  <Controller
                    name="story_points"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        min="1"
                        max="21"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        className="form-input"
                      />
                    )}
                  />
                  {errors.story_points && <span className="error-text">{errors.story_points.message}</span>}
                </div>

                <div className="form-group">
                  <label>Срок выполнения</label>
                  <Controller
                    name="due_date"
                    control={control}
                    render={({ field }) => (
                      <input type="date" {...field} value={field.value || ''} className="form-input" />
                    )}
                  />
                </div>
              </div>

              {modalTask?.Attachments?.length > 0 && (
                <div className="attachments-section">
                  <h4>Текущие вложения ({modalTask.Attachments.length})</h4>
                  <div className="attachments-grid">
                    {modalTask.Attachments.map((att) => (
                      <div key={att.id} className="attachment-item">
                        <img src={`http://localhost:5000${att.file_url}`} alt={att.file_name} />
                        <p>{att.file_name}</p>
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="btn btn-danger btn-small"
                          disabled={!canDeleteAttachment(att)}
                          title={!canDeleteAttachment(att) ? 'Нет прав на удаление' : ''}
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Добавить изображения (до 10)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-file-input"
                />
                {selectedFiles.length > 0 && <p className="file-info">Выбрано: {selectedFiles.length} файлов</p>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary btn-submit">
                  {modalTask ? 'Сохранить изменения' : 'Создать задачу'}
                </button>
              </div>
            </form>
          ) : (
            <div className="task-view">
              <h3>{modalTask?.title}</h3>
              <div className="task-details">
                <p><strong>Описание:</strong> {modalTask?.description || '—'}</p>
                <p><strong>Проект:</strong> {modalTask?.Project?.name || '—'}</p>
                <p><strong>Итерация:</strong> {modalTask?.Iteration?.name || '—'}</p>
                <p><strong>Приоритет:</strong> <span className={`priority-tag priority-${modalTask?.priority}`}>{getPriorityLabel(modalTask?.priority)}</span></p>
                <p><strong>Статус:</strong> <span className={`status-tag status-${modalTask?.status}`}>{getStatusLabel(modalTask?.status)}</span></p>
                <p><strong>Story Points:</strong> {modalTask?.story_points || '—'}</p>
                <p><strong>Срок:</strong> {modalTask?.due_date ? new Date(modalTask.due_date).toLocaleDateString('ru-RU') : '—'}</p>
                <p><strong>Исполнитель:</strong> {modalTask?.Assignee?.full_name || '—'}</p>
                <p><strong>Репортер:</strong> {modalTask?.Reporter?.full_name || '—'}</p>
              </div>

              {modalTask?.Attachments?.length > 0 && (
                <div className="attachments-section view-mode">
                  <h4>Вложения ({modalTask.Attachments.length})</h4>
                  <div className="attachments-grid">
                    {modalTask.Attachments.map((att) => (
                      <div key={att.id} className="attachment-item view">
                        <img src={`http://localhost:5000${att.file_url}`} alt={att.file_name} />
                        <p>{att.file_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="task-view-actions">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="btn btn-primary"
                  disabled={!canEditOrDeleteTask(modalTask)}
                  title={!canEditOrDeleteTask(modalTask) ? 'Нет прав на редактирование' : ''}
                >
                  Редактировать задачу
                </button>
                <button onClick={closeModal} className="btn btn-secondary">
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to   { transform: translateX(100%); opacity: 0; }
          }
          .status-notification {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: 14px;
          }
        `}
      </style>
    </div>
  );
};

export default TasksPage;