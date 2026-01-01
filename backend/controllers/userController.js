const { User, ProjectMember, Task } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.getAll = async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'full_name', 'email', 'created_at'],
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    res.status(user ? 200 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};