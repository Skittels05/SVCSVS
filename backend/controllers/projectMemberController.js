const { ProjectMember, Project, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');

exports.create = async (req, res, next) => {
  try {
    const member = await ProjectMember.create(req.body);
    const fullMember = await ProjectMember.findById(member._id).populate([
      { path: 'project_id', select: 'name' },
      { path: 'user_id', select: 'full_name email' },
    ]);

    const formatted = fullMember.toObject();
    formatted.Project = formatted.project_id;
    formatted.User = formatted.user_id;
    formatted.id = formatted._id;

    res.status(201).json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, sort, limit, skip } = parseQuery(req.query);

    const count = await ProjectMember.countDocuments(where);
    const rows = await ProjectMember.find(where)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate([
        { path: 'project_id', select: 'name' },
        { path: 'user_id', select: 'full_name email' },
      ]);

    const formattedRows = rows.map(member => {
      const obj = member.toObject();
      obj.Project = obj.project_id;
      obj.User = obj.user_id;
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
    const member = await ProjectMember.findById(req.params.id).populate([
      { path: 'project_id', select: 'name' },
      { path: 'user_id', select: 'full_name email' },
    ]);

    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      throw error;
    }

    const formatted = member.toObject();
    formatted.Project = formatted.project_id;
    formatted.User = formatted.user_id;
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate([
        { path: 'project_id', select: 'name' },
        { path: 'user_id', select: 'full_name email' },
      ]);

    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      throw error;
    }

    const formatted = member.toObject();
    formatted.Project = formatted.project_id;
    formatted.User = formatted.user_id;
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const member = await ProjectMember.findByIdAndDelete(req.params.id);
    if (!member) {
      const error = new Error('Участник проекта не найден');
      error.status = 404;
      throw error;
    }
    res.status(204).send();
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

    const members = await ProjectMember.find({ project_id })
      .populate({ path: 'user_id', select: 'full_name email' })
      .sort({ 'user_id.full_name': 1 });

    // Возвращаем только пользователей (как раньше)
    const users = members.map(pm => pm.user_id);

    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const member = await ProjectMember.findById(req.params.id);
    res.status(member ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};