const { Task, Project, Iteration, User, Attachment } = require('../models');
const { parseQuery } = require('../helpers/queryParser');
const { Op } = require('sequelize');

const {
  hasProjectAccess,
  hasTaskAccess,
  getAccessibleProjectIds,
} = require('../utils/accessUtils');

exports.create = async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id обязателен' });
    }

    const hasAccess = await hasProjectAccess(project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет доступа к проекту для создания задачи' });
    }

    req.body.reporter_id = req.user.id;

    const task = await Task.create(req.body);

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: Iteration, attributes: ['id', 'name'] },
        { model: User, as: 'Reporter', attributes: ['id', 'full_name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'full_name'] },
        { model: Task, as: 'ParentTask', attributes: ['id', 'title'] },
      ],
    });

    res.status(201).json(fullTask);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit = 10, offset = 0 } = parseQuery(req.query);
    const userId = req.user.id;
    const userRights = req.user.rights;

    let taskWhere = { ...where };

    if (userRights !== 'admin') {
      const accessibleProjectIds = await getAccessibleProjectIds(userId, userRights);

      if (!accessibleProjectIds || accessibleProjectIds.length === 0) {
        return res.json({
          total: 0,
          pages: 0,
          page: 1,
          data: [],
        });
      }

      taskWhere = {
        ...taskWhere,
        [Op.or]: [
          { project_id: { [Op.in]: accessibleProjectIds } },
          { reporter_id: userId },
          { assignee_id: userId },
        ],
      };
    }

    const { count, rows } = await Task.findAndCountAll({
      where: taskWhere,
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
      distinct: true,
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
        { model: Project, attributes: ['id', 'name'] },
        { model: Iteration, attributes: ['id', 'name'] },
        { model: User, as: 'Reporter', attributes: ['id', 'full_name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'full_name'] },
        { model: Task, as: 'ParentTask', attributes: ['id', 'title'] },
        { model: Task, as: 'SubTasks', attributes: ['id', 'title'] },
        { model: Attachment, include: [{ model: User, as: 'Uploader', attributes: ['id', 'full_name'] }] },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const hasAccess = await hasTaskAccess(task.id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет доступа к этой задаче' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const hasAccess = await hasTaskAccess(task.id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Только создатель, исполнитель или администратор может изменять задачу' });
    }

    await task.update(req.body);

    const updated = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: Iteration, attributes: ['id', 'name'] },
        { model: User, as: 'Reporter', attributes: ['id', 'full_name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'full_name'] },
        { model: Task, as: 'ParentTask', attributes: ['id', 'title'] },
        { model: Task, as: 'SubTasks', attributes: ['id', 'title'] },
        { model: Attachment, include: [{ model: User, as: 'Uploader', attributes: ['id', 'full_name'] }] },
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

    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    const hasAccess = await hasTaskAccess(task.id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Только создатель, исполнитель или администратор может удалять задачу' });
    }

    await task.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).send();
    }

    const hasAccess = await hasTaskAccess(task.id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(404).send();
    }

    res.status(200).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};