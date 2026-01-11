const { User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    console.log('[USER CREATE] Пришедшее тело запроса:', JSON.stringify(req.body, null, 2));

    const lastUser = await User.findOne().sort({ _id: -1 }).select('_id');
    const newId = lastUser ? lastUser._id + 1 : 1;

    const userData = { ...req.body, _id: newId };

    console.log('[USER CREATE] Тело для сохранения с новым _id:', JSON.stringify(userData, null, 2));

    const user = await User.create(userData);

    const formatted = user.toObject();
    formatted.id = formatted._id;

    console.log('[USER CREATE] Финальный ответ клиенту:', JSON.stringify(formatted, null, 2));

    res.status(201).json(formatted);
  } catch (err) {
    console.error('[USER CREATE] Ошибка:', err);
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, sort, limit, skip } = parseQuery(req.query);

    const count = await User.countDocuments(where);
    const rows = await User.find(where)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select('full_name email created_at');

    const formattedRows = rows.map(user => {
      const obj = user.toObject();
      obj.id = obj._id;
      return obj;
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      page: parseInt(req.query.page || 1),
      data: formattedRows,
    });
  } catch (err) {
    console.error('Ошибка в user.getAll:', err);
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('full_name email created_at');

    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      throw error;
    }

    const formatted = user.toObject();
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('full_name email created_at');

    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      throw error;
    }

    const formatted = user.toObject();
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      const error = new Error('Пользователь не найден');
      error.status = 404;
      throw error;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(user ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};