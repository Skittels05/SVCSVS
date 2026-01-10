const { Iteration, Project } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    console.log('[ITERATION CREATE] Пришедшее тело:', JSON.stringify(req.body, null, 2));

    const lastIteration = await Iteration.findOne().sort({ _id: -1 }).select('_id');
    const newId = lastIteration ? lastIteration._id + 1 : 1;

    const cleanBody = { ...req.body, _id: newId };

    const iteration = await Iteration.create(cleanBody);

    const fullIteration = await Iteration.findById(iteration._id)
      .populate('project_id', 'name');

    const formatted = fullIteration.toObject();
    formatted.Project = formatted.project_id;
    formatted.id = formatted._id;

    console.log('[ITERATION CREATE] Финальный ответ:', JSON.stringify(formatted, null, 2));

    res.status(201).json(formatted);
  } catch (err) {
    console.error('[ITERATION CREATE] Ошибка:', err);
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    let { where, sort, limit, skip } = parseQuery(req.query);
    if (req.query.type) where.type = req.query.type;

    const count = await Iteration.countDocuments(where);
    const rows = await Iteration.find(where)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate({ path: 'project_id', select: 'name' });

    const formattedRows = rows.map(iter => {
      const obj = iter.toObject();
      obj.Project = obj.project_id;
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
    const iteration = await Iteration.findById(req.params.id)
      .populate('project_id', 'name');

    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      throw error;
    }

    const formatted = iteration.toObject();
    formatted.Project = formatted.project_id;
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('project_id', 'name');

    if (!iteration) {
      const error = new Error('Итерация не найдена');
      error.status = 404;
      throw error;
    }

    const formatted = iteration.toObject();
    formatted.Project = formatted.project_id;
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const iteration = await Iteration.findByIdAndDelete(req.params.id);
    if (!iteration) {
      const error = new Error('Итерация не найдена');
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
    const iteration = await Iteration.findById(req.params.id);
    res.status(iteration ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};