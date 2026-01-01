const { Project, ProjectMember, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    const fullProject = await Project.findByPk(project.id, {
      include: [{ model: ProjectMember, include: [User] }],
    });
    res.status(201).json(fullProject);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit, offset } = parseQuery(req.query);
    const { count, rows } = await Project.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ['id', 'full_name', 'email'] }] }],
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
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: ProjectMember, include: [{ model: User }] }],
    });
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    await project.update(req.body);
    const updated = await Project.findByPk(project.id, {
      include: [{ model: ProjectMember, include: [User] }],
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.delete = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    await project.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    res.status(project ? 200 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};