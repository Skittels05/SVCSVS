const { ProjectMember, Project, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    const member = await ProjectMember.create(req.body);
    const fullMember = await ProjectMember.findByPk(member.id, {
      include: [Project, User],
    });
    res.status(201).json(fullMember);
  } catch (err) {
    next(err);
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
      } else {
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
    next(err);
  }
};

exports.getMembersByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      const error = new Error('project_id обязателен');
      error.status = 400;
      throw error;
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
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id, {
      include: [Project, User],
    });
    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      throw error;
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id);
    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      throw error;
    }
    await member.update(req.body);
    const updated = await ProjectMember.findByPk(member.id, { include: [Project, User] });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id);
    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      throw error;
    }
    await member.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id);
    res.status(member ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};