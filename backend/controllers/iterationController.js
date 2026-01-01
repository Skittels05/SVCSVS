const { Iteration, Project } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res) => {
  try {
    const iteration = await Iteration.create(req.body);
    const fullIteration = await Iteration.findByPk(iteration.id, { include: [Project] });
    res.status(201).json(fullIteration);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit, offset } = parseQuery(req.query);
    const { count, rows } = await Iteration.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [{ model: Project, attributes: ['id', 'name'] }],
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
    const iteration = await Iteration.findByPk(req.params.id, { include: [Project] });
    if (!iteration) return res.status(404).json({ error: 'Итерация не найдена' });
    res.json(iteration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id);
    if (!iteration) return res.status(404).json({ error: 'Итерация не найдена' });
    await iteration.update(req.body);
    const updated = await Iteration.findByPk(iteration.id, { include: [Project] });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.delete = async (req, res) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id);
    if (!iteration) return res.status(404).json({ error: 'Итерация не найдена' });
    await iteration.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const iteration = await Iteration.findByPk(req.params.id);
    res.status(iteration ? 200 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};