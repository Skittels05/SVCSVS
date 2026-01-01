const { ProjectMember, Project, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res) => {
  try {
    const member = await ProjectMember.create(req.body);
    const fullMember = await ProjectMember.findByPk(member.id, {
      include: [Project, User],
    });
    res.status(201).json(fullMember);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit, offset } = parseQuery(req.query);
    const { count, rows } = await ProjectMember.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'full_name', 'email'] },
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
    const member = await ProjectMember.findByPk(req.params.id, {
      include: [Project, User],
    });
    if (!member) return res.status(404).json({ error: 'Участник проекта не найден' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Участник проекта не найден' });
    await member.update(req.body);
    const updated = await ProjectMember.findByPk(member.id, { include: [Project, User] });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.delete = async (req, res) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Участник проекта не найден' });
    await member.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id);
    res.status(member ? 200 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};