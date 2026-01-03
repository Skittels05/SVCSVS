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
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadMiddleware = upload.single('file');


exports.create = (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Ошибка загрузки: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Файл обязателен' });
    }

    try {
      const fileUrl = `/uploads/${req.file.filename}`;

      const attachmentData = {
        task_id: req.body.task_id ? parseInt(req.body.task_id, 10) : null,
        user_id: req.body.user_id ? parseInt(req.body.user_id, 10) : null,
        file_name: req.file.originalname,
        file_url: fileUrl,
      };

      const attachment = await Attachment.create(attachmentData);

      const fullAttachment = await Attachment.findByPk(attachment.id, {
        include: [
          { model: Task, attributes: ['id', 'title'] },
          { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
        ],
      });

      res.status(201).json(fullAttachment);
    } catch (error) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(400).json({ error: error.message || 'Ошибка при сохранении вложения' });
    }
  });
};

exports.getAll = async (req, res) => {
  try {
    const { where, order, limit, offset } = parseQuery(req.query);
    const { count, rows } = await Attachment.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: Task, attributes: ['id', 'title'] },
        { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
      ],
    });
    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      page: parseInt(req.query.page || 1),
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id, {
      include: [
        { model: Task, attributes: ['id', 'title'] },
        { model: User, as: 'Uploader', attributes: ['id', 'full_name'] },
      ],
    });
    if (!attachment) return res.status(404).json({ error: 'Вложение не найдено' });
    res.json(attachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) return res.status(404).json({ error: 'Вложение не найдено' });

    await attachment.update(req.body);

    const updated = await Attachment.findByPk(attachment.id, {
      include: [
        { model: Task, attributes: ['id', 'title'] },
        { model: User, as: 'Uploader' },
      ],
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Ошибка валидации' });
  }
};

exports.delete = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    if (!attachment) return res.status(404).json({ error: 'Вложение не найдено' });

    const filePath = path.join(__dirname, '..', attachment.file_url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await attachment.destroy();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkExists = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);
    res.status(attachment ? 200 : 404).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};