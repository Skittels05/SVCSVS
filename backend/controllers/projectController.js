const { Project, ProjectMember, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    const fullProject = await Project.findByPk(project.id, {
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ['id', 'full_name', 'email'] }] }],
    });
    res.status(201).json(fullProject);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit = 10, offset = 0 } = parseQuery(req.query);
    const total = await Project.count({ where });
    const rows = await Project.findAll({
      where,
      order,
      limit,
      offset,
      attributes: ['id', 'name', 'description', 'project_type', 'status', 'created_at', 'updated_at'],
    });
    const pages = Math.ceil(total / limit);

    res.json({
      total,
      pages,
      page: parseInt(req.query.page || 1),
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ['id', 'full_name', 'email'] }] }],
    });
    if (!project) {
      const error = new Error('Проект не найден');
      error.status = 404;
      throw error;
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      const error = new Error('Проект не найден');
      error.status = 404;
      throw error;
    }
    await project.update(req.body);
    const updated = await Project.findByPk(project.id, {
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ['id', 'full_name', 'email'] }] }],
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      const error = new Error('Проект не найден');
      error.status = 404;
      throw error;
    }
    await project.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    res.status(project ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};