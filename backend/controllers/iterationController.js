const { Iteration, Project } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    const iteration = await Iteration.create(req.body);
    const fullIteration = await Iteration.findByPk(iteration.id, { include: [Project] });
    res.status(201).json(fullIteration);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit = 10, offset = 0 } = parseQuery(req.query);
    if (req.query.type) {
      where.type = req.query.type;
    }

    const { count, rows } = await Iteration.findAndCountAll({
      where,
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
    const iteration = await Iteration.findByPk(req.params.id, { include: [Project] });
    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      throw error;
    }
    res.json(iteration);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id);
    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      throw error;
    }
    await iteration.update(req.body);
    const updated = await Iteration.findByPk(iteration.id, { include: [Project] });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id);
    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      throw error;
    }
    await iteration.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id);
    res.status(iteration ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};