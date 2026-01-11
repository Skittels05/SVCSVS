const { Project } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    console.log('[PROJECT CREATE] Пришедшее тело:', JSON.stringify(req.body, null, 2));

    const lastProject = await Project.findOne().sort({ _id: -1 }).select('_id');
    const newId = lastProject ? lastProject._id + 1 : 1;

    const cleanBody = { ...req.body, _id: newId };

    const project = await Project.create(cleanBody);

    const fullProject = await Project.findById(project._id).populate({
      path: 'projectMembers',
      populate: { path: 'user_id', select: 'full_name email' }
    });

    const formatted = fullProject.toObject();
    formatted.id = formatted._id;

    console.log('[PROJECT CREATE] Финальный ответ:', JSON.stringify(formatted, null, 2));

    res.status(201).json(formatted);
  } catch (err) {
    console.error('[PROJECT CREATE] Ошибка:', err);
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, sort, limit, skip } = parseQuery(req.query);
    console.log('[GET ALL] Полученный sort из query:', req.query.sort);
    console.log('[GET ALL] Распарсенный mongoSort:', sort);

    const count = await Project.countDocuments(where);
    const rows = await Project.find(where)
      .sort(sort || { _id: 1 })
      .limit(limit)
      .skip(skip);
      console.log('[PROJECT GET ALL] Первые 3 id после сортировки:', rows.slice(0,5).map(r => r._id));

    const formattedRows = rows.map(project => {
      const obj = project.toObject();
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
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate({
      path: 'projectMembers',
      populate: { path: 'user_id', select: 'full_name email' }
    });

    if (!project) {
      const error = new Error('Проект не найден');
      error.status = 404;
      throw error;
    }

    const formatted = project.toObject();
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate({
        path: 'projectMembers',
        populate: { path: 'user_id', select: 'full_name email' }
      });

    if (!project) {
      const error = new Error('Проект не найден');
      error.status = 404;
      throw error;
    }

    const formatted = project.toObject();
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      const error = new Error('Проект не найден');
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
    const project = await Project.findById(req.params.id);
    res.status(project ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};