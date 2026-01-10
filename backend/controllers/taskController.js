const { Task, Project, Iteration, User, Attachment } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    console.log('[TASK CREATE] Пришедшее тело запроса:', JSON.stringify(req.body, null, 2));

    const lastTask = await Task.findOne().sort({ _id: -1 }).select('_id');
    const newId = lastTask ? lastTask._id + 1 : 1;

    const cleanBody = { ...req.body, _id: newId };

    cleanBody.project_id = cleanBody.project_id
      ? Number(cleanBody.project_id.id || cleanBody.project_id._id || cleanBody.project_id)
      : null;

    cleanBody.iteration_id = cleanBody.iteration_id
      ? Number(cleanBody.iteration_id.id || cleanBody.iteration_id._id || cleanBody.iteration_id)
      : null;

    cleanBody.reporter_id = cleanBody.reporter_id
      ? Number(cleanBody.reporter_id.id || cleanBody.reporter_id._id || cleanBody.reporter_id)
      : null;

    cleanBody.assignee_id = cleanBody.assignee_id
      ? Number(cleanBody.assignee_id.id || cleanBody.assignee_id._id || cleanBody.assignee_id)
      : null;

    cleanBody.parent_task_id = cleanBody.parent_task_id
      ? Number(cleanBody.parent_task_id.id || cleanBody.parent_task_id._id || cleanBody.parent_task_id)
      : null;

    console.log('[TASK CREATE] Очищенное тело с новым _id:', JSON.stringify(cleanBody, null, 2));

    const task = await Task.create(cleanBody);

    const fullTask = await Task.findById(task._id).populate([
      { path: 'project_id', select: 'name' },
      { path: 'iteration_id', select: 'name' },
      { path: 'reporter_id', select: 'full_name', as: 'Reporter' },
      { path: 'assignee_id', select: 'full_name', as: 'Assignee' },
      { path: 'parent_task_id', select: 'title' },
      { path: 'attachments', select: 'file_name file_url' },
    ]);

    const formatted = fullTask.toObject();
    formatted.Project = formatted.project_id;
    formatted.Iteration = formatted.iteration_id;
    formatted.Reporter = formatted.reporter_id;
    formatted.Assignee = formatted.assignee_id;
    formatted.id = formatted._id;

    console.log('[TASK CREATE] Финальный ответ клиенту:', JSON.stringify(formatted, null, 2));

    res.status(201).json(formatted);
  } catch (err) {
    console.error('[TASK CREATE] Ошибка:', err);
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    console.log('[TASK GET ALL] Запрос параметров:', req.query);

    const { where, sort, limit, skip } = parseQuery(req.query);

    const count = await Task.countDocuments(where);

    let query = Task.find(where)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    query = query.populate('project_id', 'name');
    query = query.populate('iteration_id', 'name');
    query = query.populate('reporter_id', 'full_name');
    query = query.populate('assignee_id', 'full_name');
    query = query.populate('attachments', 'file_name file_url');

    const rows = await query;

    console.log('[TASK GET ALL] Найдено задач:', rows.length);

    const formattedRows = rows.map(task => {
      const obj = task.toObject();
      obj.Project = obj.project_id;
      obj.Iteration = obj.iteration_id;
      obj.Reporter = obj.reporter_id;
      obj.Assignee = obj.assignee_id;
      obj.id = obj._id;
      return obj;
    });

    const response = {
      total: count,
      pages: Math.ceil(count / limit),
      page: parseInt(req.query.page || 1),
      data: formattedRows,
    };

    console.log('[TASK GET ALL] Отправляем клиенту:', response.data.length, 'задач');

    res.json(response);
  } catch (err) {
    console.error('[TASK GET ALL] Ошибка:', err);
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    console.log('[TASK GET BY ID] Запрашиваем задачу:', req.params.id);

    const task = await Task.findById(req.params.id).populate([
      { path: 'project_id', select: 'name' },
      { path: 'iteration_id', select: 'name' },
      { path: 'reporter_id', select: 'full_name', as: 'Reporter' },
      { path: 'assignee_id', select: 'full_name', as: 'Assignee' },
      { path: 'parent_task_id', select: 'title' },
      { path: 'subTasks', select: 'title status priority' },
      { path: 'attachments', select: 'file_name file_url', 
        populate: { path: 'user_id', select: 'full_name', as: 'Uploader' } 
      },
    ]);

    if (!task) {
      console.log('[TASK GET BY ID] Задача не найдена:', req.params.id);
      const error = new Error('Задача не найдена');
      error.status = 404;
      throw error;
    }

    const formatted = task.toObject();
    formatted.Project = formatted.project_id;
    formatted.Iteration = formatted.iteration_id;
    formatted.Reporter = formatted.reporter_id;
    formatted.Assignee = formatted.assignee_id;
    formatted.id = formatted._id;

    console.log('[TASK GET BY ID] Отправляем задачу:', formatted.id);

    res.json(formatted);
  } catch (err) {
    console.error('[TASK GET BY ID] Ошибка:', err);
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    console.log('[TASK UPDATE] Пришедшее тело запроса:', JSON.stringify(req.body, null, 2));

    const cleanBody = { ...req.body };

    cleanBody.project_id = cleanBody.project_id
      ? Number(cleanBody.project_id.id || cleanBody.project_id._id || cleanBody.project_id)
      : null;

    cleanBody.iteration_id = cleanBody.iteration_id
      ? Number(cleanBody.iteration_id.id || cleanBody.iteration_id._id || cleanBody.iteration_id)
      : null;

    cleanBody.reporter_id = cleanBody.reporter_id
      ? Number(cleanBody.reporter_id.id || cleanBody.reporter_id._id || cleanBody.reporter_id)
      : null;

    cleanBody.assignee_id = cleanBody.assignee_id
      ? Number(cleanBody.assignee_id.id || cleanBody.assignee_id._id || cleanBody.assignee_id)
      : null;

    cleanBody.parent_task_id = cleanBody.parent_task_id
      ? Number(cleanBody.parent_task_id.id || cleanBody.parent_task_id._id || cleanBody.parent_task_id)
      : null;

    console.log('[TASK UPDATE] Очищенное тело для обновления:', JSON.stringify(cleanBody, null, 2));

    const task = await Task.findByIdAndUpdate(req.params.id, cleanBody, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'project_id', select: 'name' },
      { path: 'iteration_id', select: 'name' },
      { path: 'reporter_id', select: 'full_name', as: 'Reporter' },
      { path: 'assignee_id', select: 'full_name', as: 'Assignee' },
      { path: 'parent_task_id', select: 'title' },
      { path: 'subTasks', select: 'title status priority' },
      { path: 'attachments', select: 'file_name file_url', 
        populate: { path: 'user_id', select: 'full_name', as: 'Uploader' } 
      },
    ]);

    if (!task) {
      console.log('[TASK UPDATE] Задача не найдена:', req.params.id);
      const error = new Error('Задача не найдена');
      error.status = 404;
      throw error;
    }

    const formatted = task.toObject();
    formatted.Project = formatted.project_id;
    formatted.Iteration = formatted.iteration_id;
    formatted.Reporter = formatted.reporter_id;
    formatted.Assignee = formatted.assignee_id;
    formatted.id = formatted._id;

    console.log('[TASK UPDATE] Финальный обновлённый ответ:', JSON.stringify(formatted, null, 2));

    res.json(formatted);
  } catch (err) {
    console.error('[TASK UPDATE] Ошибка:', err);
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    console.log('[TASK DELETE] Удаляем задачу:', req.params.id);

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      console.log('[TASK DELETE] Задача не найдена:', req.params.id);
      const error = new Error('Задача не найдена');
      error.status = 404;
      throw error;
    }

    console.log('[TASK DELETE] Успешно удалена задача:', req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('[TASK DELETE] Ошибка:', err);
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    console.log('[TASK CHECK EXISTS] Задача существует:', !!task);
    res.status(task ? 200 : 404).send();
  } catch (err) {
    console.error('[TASK CHECK EXISTS] Ошибка:', err);
    next(err);
  }
};