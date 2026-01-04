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

exports.getAll = async (req, res, next) => {
  try {
    let { where, limit = 10, offset = 0 } = parseQuery(req.query);
    let orderArray = [['id', 'ASC']];

    if (req.query.sort) {
      const sortString = req.query.sort;
      const [fullField, direction = 'ASC'] = sortString.split(':');
      const dir = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      if (fullField === 'Project.name') {
        orderArray = [[{ model: Project, as: 'Project' }, 'name', dir]];
      } else if (fullField === 'User.full_name') {
        orderArray = [[{ model: User, as: 'User' }, 'full_name', dir]];
      } else if (fullField === 'role') {
        orderArray = [[fullField, dir]];
      } else if (fullField === 'id') {
        orderArray = [[fullField, dir]];
      }
    }

    const { count, rows } = await ProjectMember.findAndCountAll({
      where,
      limit,
      offset,
      order: orderArray,
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'full_name', 'email'] },
      ],
      distinct: true,
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      page: parseInt(req.query.page || 1),
      data: rows,
    });
  } catch (err) {
    console.error('Ошибка в getAll project-members:', err);
    next(err);
  }
};

exports.getMembersByProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({ error: 'project_id обязателен' });
    }

    const members = await ProjectMember.findAll({
      where: { project_id: parseInt(project_id, 10) },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [[User, 'full_name', 'ASC']],
    });

    const users = members.map((pm) => pm.User);

    res.json(users);
  } catch (err) {
    console.error('Ошибка получения участников проекта:', err);
    res.status(500).json({ error: 'Ошибка загрузки участников проекта' });
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