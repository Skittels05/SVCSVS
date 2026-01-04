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

exports.create = (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      const noFileError = new Error('Не загружено ни одного файла');
      noFileError.status = 400;
      return next(noFileError);
    }

    const taskId = req.body.task_id ? parseInt(req.body.task_id, 10) : null;
    if (!taskId) {
      const error = new Error('task_id обязателен');
      error.status = 400;
      return next(error);
    }

    try {
      const createdAttachments = [];

      for (const file of req.files) {
        const fileUrl = `/uploads/${file.filename}`;

        const attachmentData = {
          task_id: taskId,
          user_id: req.body.user_id ? parseInt(req.body.user_id, 10) : null,
          file_name: file.originalname,
          file_url: fileUrl,
        };

        const attachment = await Attachment.create(attachmentData);
        createdAttachments.push(attachment);
      }

      const fullAttachments = await Attachment.findAll({
        where: { id: createdAttachments.map(a => a.id) },
        include: [
          { model: Task, attributes: ['id', 'title'] },
          { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
        ],
      });

      res.status(201).json(fullAttachments);
    } catch (error) {
      req.files.forEach((file) => {
        const filePath = file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      next(error);
    }
  });
};

exports.getAll = async (req, res, next) => {
  try {
    const { where, order, limit, offset, include } = parseQuery(req.query);

    const { count, rows } = await Task.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: Iteration, attributes: ['id', 'name'] },
        { model: User, as: 'Reporter', attributes: ['id', 'full_name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'full_name'] },
        
      ],
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
    const attachment = await Attachment.findByPk(req.params.id, {
      include: [
        { model: Task, attributes: ['id', 'title'] },
        { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
      ],
    });

    if (!attachment) {
      const error = new Error('Вложение не найдено');
      error.status = 404;
      throw error;
    }

    res.json(attachment);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) {
      const error = new Error('Вложение не найдено');
      error.status = 404;
      throw error;
    }

    await attachment.update(req.body);

    const updated = await Attachment.findByPk(req.params.id, {
      include: [
        { model: Task, attributes: ['id', 'title'] },
        { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
      ],
    });

    res.json(updated);
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