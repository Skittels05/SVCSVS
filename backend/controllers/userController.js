const { User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset } = parseQuery(req.query);
    const { count, rows } = await User.findAndCountAll({
      where,
      order,
      limit,
      offset,
      attributes: ['id', 'full_name', 'email', 'created_at'],
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
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'full_name', 'email', 'created_at'],
    });
    if (!user) {
      const notFoundError = new Error('Пользователь не найден');
      notFoundError.status = 404;
      throw notFoundError;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      const notFoundError = new Error('Пользователь не найден');
      notFoundError.status = 404;
      throw notFoundError;
    }
    await user.update(req.body);
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: ['id', 'full_name', 'email', 'created_at'],
    });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      const notFoundError = new Error('Пользователь не найден');
      notFoundError.status = 404;
      throw notFoundError;
    }
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    res.status(user ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};