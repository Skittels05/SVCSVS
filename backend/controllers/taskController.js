const { Task, Project, Iteration, User, Attachment } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: Iteration, attributes: ['id', 'name'] },
        { model: User, as: 'Reporter', attributes: ['id', 'full_name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'full_name'] },
        { model: Task, as: 'ParentTask' },
      ],
    });
    res.status(201).json(fullTask);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit, offset } = parseQuery(req.query);
    const { count, rows } = await Task.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: Iteration, attributes: ['id', 'name'] },
        { model: User, as: 'Reporter', attributes: ['id', 'full_name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'full_name'] },
        { model: Attachment, attributes: ['id', 'file_name', 'file_url'] },
      ],
    });
    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      page: parseInt(req.query.page || 1),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Project },
        { model: Iteration },
        { model: User, as: 'Reporter' },
        { model: User, as: 'Assignee' },
        { model: Task, as: 'ParentTask' },
        { model: Task, as: 'SubTasks' },
        { model: Attachment, include: [{ model: User, as: 'Uploader' }] },
      ],
    });
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    await task.update(req.body);
    const updated = await Task.findByPk(task.id, {
      include: [
        Project, Iteration,
        { model: User, as: 'Reporter' },
        { model: User, as: 'Assignee' },
        { model: Task, as: 'ParentTask' },
        { model: Task, as: 'SubTasks' },
        { model: Attachment, include: [{ model: User, as: 'Uploader' }] },
      ],
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.delete = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    await task.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    res.status(task ? 200 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};