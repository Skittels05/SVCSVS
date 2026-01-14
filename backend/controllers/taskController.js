const { Task } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    console.log('[TASK CREATE] Пришедшее тело запроса:', JSON.stringify(req.body, null, 2));

    const lastTask = await Task.findOne().sort({ _id: -1 }).select('_id');
    const newId = lastTask ? lastTask._id + 1 : 1;

    const taskData = { ...req.body, _id: newId };

    if (taskData.project_id) taskData.project_id = Number(taskData.project_id);
    if (taskData.iteration_id) taskData.iteration_id = Number(taskData.iteration_id);
    if (taskData.reporter_id) taskData.reporter_id = Number(taskData.reporter_id);
    if (taskData.assignee_id) taskData.assignee_id = Number(taskData.assignee_id);
    if (taskData.parent_task_id) taskData.parent_task_id = Number(taskData.parent_task_id);

    console.log('[TASK CREATE] Подготовленные данные:', JSON.stringify(taskData, null, 2));

    const task = await Task.create(taskData);

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
    if (where.project) {
      where.project_id = Number(where.project);
      delete where.project;
    }
    if (where.project_id) {
      where.project_id = Number(where.project_id);
    }
    if (where.iteration_id) {
      where.iteration_id = Number(where.iteration_id);
    }

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
      {
        path: 'attachments', select: 'file_name file_url',
        populate: { path: 'user_id', select: 'full_name', as: 'Uploader' }
      },
    ]);

    if (!task) {
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

    res.json(formatted);
  } catch (err) {
    console.error('[TASK GET BY ID] Ошибка:', err);
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    console.log('[TASK UPDATE] Пришедшее тело:', JSON.stringify(req.body, null, 2));

    const updateData = { ...req.body };

    if (updateData.project_id) updateData.project_id = Number(updateData.project_id);
    if (updateData.iteration_id) updateData.iteration_id = Number(updateData.iteration_id);
    if (updateData.reporter_id) updateData.reporter_id = Number(updateData.reporter_id);
    if (updateData.assignee_id) updateData.assignee_id = Number(updateData.assignee_id);
    if (updateData.parent_task_id) updateData.parent_task_id = Number(updateData.parent_task_id);

    console.log('[TASK UPDATE] Данные для обновления:', JSON.stringify(updateData, null, 2));

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'project_id', select: 'name' },
      { path: 'iteration_id', select: 'name' },
      { path: 'reporter_id', select: 'full_name', as: 'Reporter' },
      { path: 'assignee_id', select: 'full_name', as: 'Assignee' },
      { path: 'parent_task_id', select: 'title' },
      { path: 'subTasks', select: 'title status priority' },
      {
        path: 'attachments', select: 'file_name file_url',
        populate: { path: 'user_id', select: 'full_name', as: 'Uploader' }
      },
    ]);

    if (!task) {
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
      const error = new Error('Задача не найдена');
      error.status = 404;
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    console.error('[TASK DELETE] Ошибка:', err);
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    res.status(task ? 200 : 404).send();
  } catch (err) {
    console.error('[TASK CHECK EXISTS] Ошибка:', err);
    next(err);
  }
};