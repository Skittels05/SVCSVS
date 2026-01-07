const { Project, ProjectMember, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');
const { Op } = require('sequelize');

const {
  hasProjectAccess,
  getAccessibleProjectIds,
} = require('../utils/accessUtils');

exports.create = async (req, res, next) => {
  try {
    req.body.creator_id = req.user.id;

    const project = await Project.create(req.body);

    const fullProject = await Project.findByPk(project.id, {
      include: [
        {
          model: ProjectMember,
          include: [{ model: User, attributes: ['id', 'full_name', 'email'] }],
        },
      ],
    });

    res.status(201).json(fullProject);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit = 10, offset = 0 } = parseQuery(req.query);
    const userRights = req.user.rights;

    let projectWhere = { ...where };
    let total;

    if (userRights === 'admin') {

      total = await Project.count({ where: projectWhere });
      const rows = await Project.findAll({
        where: projectWhere,
        order,
        limit,
        offset,
        attributes: ['id', 'name', 'description', 'project_type', 'status', 'created_at', 'updated_at'],
      });

      return res.json({
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(req.query.page || 1),
        data: rows,
      });
    }

    const accessibleProjectIds = await getAccessibleProjectIds(req.user.id, userRights);

    if (!accessibleProjectIds || accessibleProjectIds.length === 0) {
      return res.json({
        total: 0,
        pages: 0,
        page: 1,
        data: [],
      });
    }

    projectWhere = {
      ...projectWhere,
      id: { [Op.in]: accessibleProjectIds },
    };

    total = await Project.count({ where: projectWhere });

    const rows = await Project.findAll({
      where: projectWhere,
      order,
      limit,
      offset,
      attributes: ['id', 'name', 'description', 'project_type', 'status', 'created_at', 'updated_at'],
    });

    res.json({
      total,
      pages: Math.ceil(total / limit),
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
      include: [
        {
          model: ProjectMember,
          include: [{ model: User, attributes: ['id', 'full_name', 'email'] }],
        },
      ],
    });

    if (!project) {
      const error = new Error('Проект не найден');
      error.status = 404;
      return next(error);
    }

    const hasAccess = await hasProjectAccess(project.id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет доступа к этому проекту' });
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
      return next(error);
    }

    const isOwner = project.creator_id === req.user.id;
    const isAdmin = req.user.rights === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Только создатель проекта или администратор может его изменять' });
    }

    await project.update(req.body);

    const updated = await Project.findByPk(project.id, {
      include: [
        {
          model: ProjectMember,
          include: [{ model: User, attributes: ['id', 'full_name', 'email'] }],
        },
      ],
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
      return next(error);
    }

    const isOwner = project.creator_id === req.user.id;
    const isAdmin = req.user.rights === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Только создатель проекта или администратор может его удалить' });
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

    if (!project) {
      return res.status(404).send();
    }

    const hasAccess = await hasProjectAccess(project.id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(404).send();
    }

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};