const { Attachment, Task, User } = require('../models');
const { parseQuery } = require('../helpers/queryParser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения (jpg, png, gif, webp и т.д.)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadMiddleware = upload.array('files', 10);

exports.create = async (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) return next(err);

    if (!req.files || req.files.length === 0) {
      const error = new Error('Не загружено ни одного файла');
      error.status = 400;
      return next(error);
    }

    const taskId = req.body.task_id ? Number(req.body.task_id) : null;
    if (!taskId) {
      const error = new Error('task_id обязателен');
      error.status = 400;
      return next(error);
    }

    try {
      const createdAttachments = [];

      for (const file of req.files) {
        // Генерируем _id для каждого attachment
        const lastAtt = await Attachment.findOne().sort({ _id: -1 }).select('_id');
        const newId = lastAtt ? lastAtt._id + 1 : 1;

        const fileUrl = `/uploads/${file.filename}`;
        const attachment = await Attachment.create({
          _id: newId,
          task_id: taskId,
          user_id: req.body.user_id ? Number(req.body.user_id) : null,
          file_name: file.originalname,
          file_url: fileUrl,
        });

        createdAttachments.push(attachment);

        await Task.findByIdAndUpdate(taskId, { $push: { attachments: attachment._id } });
      }

      const fullAttachments = await Attachment.find({ _id: { $in: createdAttachments.map(a => a._id) } })
        .populate([
          { path: 'task_id', select: 'title' },
          { path: 'user_id', select: 'full_name email' },
        ]);

      const formatted = fullAttachments.map(att => {
        const obj = att.toObject();
        obj.Task = obj.task_id;
        obj.Uploader = obj.user_id;
        obj.id = obj._id;
        return obj;
      });

      res.status(201).json(formatted);
    } catch (error) {
      next(error);
    }
  });
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, sort, limit, skip } = parseQuery(req.query);

    const count = await Attachment.countDocuments(where);
    const rows = await Attachment.find(where)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate([
        { path: 'task_id', select: 'title' },
        { path: 'user_id', select: 'full_name email' },
      ]);

    const formattedRows = rows.map(att => {
      const obj = att.toObject();
      obj.Task = obj.task_id;
      obj.Uploader = obj.user_id;
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
    const attachment = await Attachment.findById(req.params.id).populate([
      { path: 'task_id', select: 'title' },
      { path: 'user_id', select: 'full_name email' },
    ]);

    if (!attachment) {
      const error = new Error('Вложение не найдено');
      error.status = 404;
      throw error;
    }

    const formatted = attachment.toObject();
    formatted.Task = formatted.task_id;
    formatted.Uploader = formatted.user_id;
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const attachment = await Attachment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate([
        { path: 'task_id', select: 'title' },
        { path: 'user_id', select: 'full_name email' },
      ]);

    if (!attachment) {
      const error = new Error('Вложение не найдено');
      error.status = 404;
      throw error;
    }

    const formatted = attachment.toObject();
    formatted.Task = formatted.task_id;
    formatted.Uploader = formatted.user_id;
    formatted.id = formatted._id;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) {
      const error = new Error('Вложение не найдено');
      error.status = 404;
      throw error;
    }

    const filePath = path.join(__dirname, '..', attachment.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await attachment.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.checkExists = async (req, res, next) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    res.status(attachment ? 200 : 404).send();
  } catch (err) {
    next(err);
  }
};