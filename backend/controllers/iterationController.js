const { Iteration, Project } = require('../models');
const { parseQuery } = require('../helpers/queryParser');
const { Op } = require('sequelize');

const {
  hasProjectAccess,
  getAccessibleProjectIds,
} = require('../utils/accessUtils');

exports.create = async (req, res, next) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      const error = new Error('project_id обязателен');
      error.status = 400;
      return next(error);
    }

    const hasAccess = await hasProjectAccess(project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет доступа к проекту для создания итерации' });
    }

    const iteration = await Iteration.create(req.body);

    const fullIteration = await Iteration.findByPk(iteration.id, {
      include: [{ model: Project, attributes: ['id', 'name'] }],
    });

    res.status(201).json(fullIteration);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit = 10, offset = 0 } = parseQuery(req.query);
    const userRights = req.user.rights;

    if (req.query.type) {
      where.type = req.query.type;
    }

    let iterationWhere = { ...where };

    if (userRights !== 'admin') {
      const accessibleProjectIds = await getAccessibleProjectIds(req.user.id, userRights);

      if (!accessibleProjectIds || accessibleProjectIds.length === 0) {
        return res.json({
          total: 0,
          pages: 0,
          page: 1,
          data: [],
        });
      }

      iterationWhere.project_id = { [Op.in]: accessibleProjectIds };
    }

    const { count, rows } = await Iteration.findAndCountAll({
      where: iterationWhere,
      order,
      limit,
      offset,
      include: [{ model: Project, attributes: ['id', 'name'] }],
      distinct: true,
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      page: parseInt(req.query.page || 1),
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id, {
      include: [{ model: Project, attributes: ['id', 'name'] }],
    });

    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      return next(error);
    }

    const hasAccess = await hasProjectAccess(iteration.project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет доступа к этой итерации' });
    }

    res.json(iteration);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id, {
      include: [{ model: Project }],
    });

    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      return next(error);
    }

    const hasAccess = await hasProjectAccess(iteration.project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет прав на изменение этой итерации' });
    }

    await iteration.update(req.body);

    const updated = await Iteration.findByPk(iteration.id, {
      include: [{ model: Project, attributes: ['id', 'name'] }],
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id, {
      include: [{ model: Project }],
    });

    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      return next(error);
    }

    const hasAccess = await hasProjectAccess(iteration.project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет прав на удаление этой итерации' });
    }

    await iteration.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id, {
      include: [{ model: Project }],
    });

    if (!iteration) {
      return res.status(404).send();
    }

    const hasAccess = await hasProjectAccess(iteration.project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(404).send();
    }

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};