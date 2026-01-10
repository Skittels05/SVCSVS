import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTask } from '../../store/slices/tasksSlice';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './KanbanBoardPage.css';

const statusColumns = [
  { id: 'backlog', title: 'Бэклог' },
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'В работе' },
  { id: 'review', title: 'На проверке' },
  { id: 'done', title: 'Готово' },
];

const KanbanColumn = ({ column, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="kanban-column"
      id={column.id}
      style={{
        backgroundColor: isOver ? '#d0e8ff' : '#ebecf0',
        transition: 'background-color 0.2s ease',
      }}
    >
      <h3>{column.title} ({column.tasks?.length || 0})</h3>
      <div className="kanban-tasks">{children}</div>
    </div>
  );
};

const TaskCard = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
    >
      <h4>{task.title}</h4>
      <p className="kanban-priority">{task.priority}</p>
      {task.Assignee && <p className="kanban-assignee">{task.Assignee.full_name}</p>}
      {task.story_points && <p className="kanban-points">{task.story_points} SP</p>}
    </div>
  );
};

const KanbanBoardPage = () => {
  const dispatch = useDispatch();
  const { list: allTasks } = useSelector((state) => state.tasks);

  const [projects, setProjects] = useState([]);
  const [iterations, setIterations] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedIteration, setSelectedIteration] = useState(null);

  const [selectionModalOpen, setSelectionModalOpen] = useState(true);
  const [selectionStep, setSelectionStep] = useState(1);

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/projects?limit=1000');
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const iterationIdsInTasks = new Set(
        allTasks
          .filter(task => task.project_id === selectedProject.id && task.iteration_id !== null)
          .map(task => task.iteration_id)
      );

      if (iterationIdsInTasks.size === 0) {
        setIterations([]);
        setSelectedIteration(null);
        return;
      }

      const loadUsedIterations = async () => {
        try {
          const response = await api.get(`/iterations?project_id=${selectedProject.id}&limit=100`);
          const allProjectIterations = response.data.data || [];

          const usedIterations = allProjectIterations.filter(iter =>
            iterationIdsInTasks.has(iter.id)
          );

          usedIterations.sort((a, b) => {
            if (a.start_date && b.start_date) {
              return new Date(a.start_date) - new Date(b.start_date);
            }
            return a.name.localeCompare(b.name);
          });

          setIterations(usedIterations);
        } catch (err) {
          console.error('Ошибка загрузки итераций:', err);
          setIterations([]);
        }
      };

      loadUsedIterations();
    } else {
      setIterations([]);
      setSelectedIteration(null);
    }
  }, [selectedProject, allTasks]);

  useEffect(() => {
    dispatch(fetchTasks({ limit: 10000 }));
  }, [dispatch]);

  const filteredTasks = allTasks.filter(task => {
    if (!selectedProject) return false;
    if (task.project_id !== selectedProject.id) return false;
    if (selectedIteration && task.iteration_id !== selectedIteration.id) return false;
    return true;
  });

  const tasksByStatus = statusColumns.map(col => ({
    ...col,
    tasks: filteredTasks.filter(t => t.status === col.id),
  }));

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = filteredTasks.find(t => t.id === active.id);
    if (!activeTask) return;

    let targetStatus = null;

    if (over.data.current?.task) {
      targetStatus = over.data.current.task.status;
    } else if (statusColumns.find(col => col.id === over.id)) {
      targetStatus = over.id;
    }

    if (!targetStatus || activeTask.status === targetStatus) {
      return;
    }

    try {
      await dispatch(updateTask({
        id: activeTask.id,
        taskData: { status: targetStatus }
      })).unwrap();

      dispatch(fetchTasks({ limit: 10000 }));
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      alert('Не удалось переместить задачу');
    }
  };

  const confirmSelection = () => {
    setSelectionModalOpen(false);
  };

  const activeTask = allTasks.find(t => t.id === activeId);

  return (
    <div className="kanban-page">
      <div className="page-header">
        <h2>Канбан-доска</h2>
        <div>
          {selectedProject && (
            <span className="current-selection">
              Проект: {selectedProject.name}
              {selectedIteration && ` → Итерация: ${selectedIteration.name}`}
            </span>
          )}
          <button onClick={() => setSelectionModalOpen(true)} className="btn btn-secondary">
            Сменить проект/итерацию
          </button>
        </div>
      </div>

      {!selectedProject ? (
        <div className="empty-board">Выберите проект и итерацию для просмотра задач</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-board">
            <SortableContext
              items={filteredTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasksByStatus.map(column => (
                <KanbanColumn key={column.id} column={column}>
                  {column.tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </KanbanColumn>
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal isOpen={selectionModalOpen} onClose={() => setSelectionModalOpen(false)} title="Выбор проекта и итерации">
        <div className="wizard">
          {selectionStep === 1 && (
            <>
              <h3>Шаг 1: Выберите проект</h3>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const proj = projects.find(p => p.id === parseInt(e.target.value));
                  setSelectedProject(proj || null);
                  setSelectedIteration(null);
                  if (proj) setSelectionStep(2);
                }}
                className="form-select"
              >
                <option value="">— Выберите проект —</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                onClick={() => setSelectionStep(2)}
                disabled={!selectedProject}
                className="btn btn-primary"
              >
                Далее
              </button>
            </>
          )}

          {selectionStep === 2 && (
            <>
              <h3>Шаг 2: Выберите итерацию (необязательно)</h3>
              {iterations.length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic', margin: '10px 0' }}>
                  В задачах этого проекта пока нет назначенных итераций.
                </p>
              )}
              <select
                value={selectedIteration?.id || ''}
                onChange={(e) => {
                  const iterId = e.target.value ? parseInt(e.target.value) : null;
                  const iter = iterations.find(i => i.id === iterId);
                  setSelectedIteration(iter || null);
                }}
                className="form-select"
                disabled={iterations.length === 0}
              >
                <option value="">— Все итерации —</option>
                {iterations.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.type})</option>
                ))}
              </select>
              <button onClick={() => setSelectionStep(1)} className="btn btn-secondary">Назад</button>
              <button onClick={confirmSelection} className="btn btn-primary">Подтвердить</button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default KanbanBoardPage;