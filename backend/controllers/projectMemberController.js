const { ProjectMember, Project, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');
const { Op } = require('sequelize');

const {
  hasProjectAccess,
  getAccessibleProjectIds,
} = require('../utils/accessUtils');

exports.create = async (req, res, next) => {
  try {
    const { project_id, user_id, role } = req.body;

    if (!project_id || !user_id || !role) {
      const error = new Error('project_id, user_id и role обязательны');
      error.status = 400;
      return next(error);
    }

    const project = await Project.findByPk(project_id, {
      attributes: ['id', 'creator_id'],
    });

    if (!project) {
      const error = new Error('Проект не найден');
      error.status = 404;
      return next(error);
    }

    const isOwner = project.creator_id === req.user.id;
    const isAdmin = req.user.rights === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Только создатель проекта или администратор может добавлять участников' });
    }

    const existingMember = await ProjectMember.findOne({
      where: { project_id, user_id },
    });

    if (existingMember) {
      const error = new Error('Пользователь уже является участником проекта');
      error.status = 409;
      return next(error);
    }

    const member = await ProjectMember.create(req.body);

    const fullMember = await ProjectMember.findByPk(member.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'full_name', 'email'] },
      ],
    });

    res.status(201).json(fullMember);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, limit = 10, offset = 0 } = parseQuery(req.query);
    const userRights = req.user.rights;

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

    let memberWhere = { ...where };

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

      memberWhere.project_id = { [Op.in]: accessibleProjectIds };
    }

    const { count, rows } = await ProjectMember.findAndCountAll({
      where: memberWhere,
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
      return next(error);
    }

    const projectId = parseInt(project_id, 10);

    const hasAccess = await hasProjectAccess(projectId, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет доступа к этому проекту' });
    }

    const members = await ProjectMember.findAll({
      where: { project_id: projectId },
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
      include: [
        { model: Project, attributes: ['id', 'name', 'creator_id'] },
        { model: User, attributes: ['id', 'full_name', 'email'] },
      ],
    });

    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      return next(error);
    }

    const hasAccess = await hasProjectAccess(member.project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Нет доступа к этому проекту' });
    }

    res.json(member);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id, {
      include: [{ model: Project, attributes: ['creator_id'] }],
    });

    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      return next(error);
    }

    const isOwner = member.Project.creator_id === req.user.id;
    const isAdmin = req.user.rights === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Только создатель проекта или администратор может изменять роль участника' });
    }

    await member.update(req.body);

    const updated = await ProjectMember.findByPk(member.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'full_name', 'email'] },
      ],
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id, {
      include: [{ model: Project, attributes: ['creator_id'] }],
    });

    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      return next(error);
    }

    const isOwner = member.Project.creator_id === req.user.id;
    const isAdmin = req.user.rights === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Только создатель проекта или администратор может удалять участников' });
    }

    await member.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByPk(req.params.id, {
      include: [{ model: Project }],
    });

    if (!member) {
      return res.status(404).send();
    }

    const hasAccess = await hasProjectAccess(member.project_id, req.user.id, req.user.rights);
    if (!hasAccess) {
      return res.status(404).send();
    }

    res.status(200).send();
  } catch (err) {
    next(err);
  }
};