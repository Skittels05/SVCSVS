const { User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      rights: user.rights,
      created_at: user.created_at,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    if (req.user.rights !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещён: только для администраторов' });
    }

    const { where, order, limit = 10, offset = 0 } = parseQuery(req.query);
    const { count, rows } = await User.findAndCountAll({
      where,
      order,
      limit,
      offset,
      attributes: ['id', 'full_name', 'email', 'created_at', 'rights'],
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
    const targetUserId = parseInt(req.params.id, 10);
    const isAdmin = req.user.rights === 'admin';
    const isOwnProfile = targetUserId === req.user.id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'Доступ запрещён: вы можете просматривать только свой профиль' });
    }

    const user = await User.findByPk(targetUserId, {
      attributes: [
        'id',
        'full_name',
        'email',
        'created_at',
        ...(isAdmin ? ['rights'] : []),
      ],
    });

    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      return next(error);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const isAdmin = req.user.rights === 'admin';
    const isOwnProfile = targetUserId === req.user.id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'Доступ запрещён: вы можете редактировать только свой профиль' });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      return next(error);
    }

    if (!isAdmin && req.body.rights !== undefined) {
      return res.status(403).json({ message: 'Изменение прав доступа запрещено' });
    }

    await user.update(req.body);

    const updatedUser = await User.findByPk(targetUserId, {
      attributes: [
        'id',
        'full_name',
        'email',
        'created_at',
        ...(isAdmin ? ['rights'] : []),
      ],
    });

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const isAdmin = req.user.rights === 'admin';
    const isOwnProfile = targetUserId === req.user.id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ message: 'Доступ запрещён: вы можете удалить только свой аккаунт' });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      return next(error);
    }

    await user.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const isAdmin = req.user.rights === 'admin';
    const isOwnProfile = targetUserId === req.user.id;

    if (!isAdmin && !isOwnProfile) {

      return res.status(404).send();
    }

    const user = await User.findByPk(targetUserId);
    res.status(user ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};