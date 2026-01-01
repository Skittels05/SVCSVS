const { Attachment, Task, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res) => {
  try {
    const attachment = await Attachment.create(req.body);
    const fullAttachment = await Attachment.findByPk(attachment.id, {
      include: [
        { model: Task, attributes: ['id', 'title'] },
        { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
      ],
    });
    res.status(201).json(fullAttachment);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit, offset } = parseQuery(req.query);
    const { count, rows } = await Attachment.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: Task, attributes: ['id', 'title'] },
        { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
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
    const attachment = await Attachment.findByPk(req.params.id, {
      include: [
        { model: Task },
        { model: User, as: 'Uploader' },
      ],
    });
    if (!attachment) return res.status(404).json({ error: 'Вложение не найдено' });
    res.json(attachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) return res.status(404).json({ error: 'Вложение не найдено' });
    await attachment.update(req.body);
    const updated = await Attachment.findByPk(attachment.id, {
      include: [Task, { model: User, as: 'Uploader' }],
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.delete = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) return res.status(404).json({ error: 'Вложение не найдено' });
    await attachment.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    res.status(attachment ? 200 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};