const { Schema, model } = require('mongoose');

const attachmentSchema = new Schema({
  _id: {
    type: Number,
    required: true
  },
  task_id: {
    type: Number,
    ref: 'Task',
    required: [true, 'task_id обязателен'],
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'user_id обязателен'],
  },
  file_name: {
    type: String,
    required: [true, 'Имя файла обязательно'],
    minlength: [1, 'Имя файла должно быть от 1 до 255 символов'],
    maxlength: [255, 'Имя файла должно быть от 1 до 255 символов'],
  },
  file_url: {
    type: String,
    required: [true, 'Путь к файлу обязателен'],
    minlength: [1, 'Путь к файлу должен быть до 500 символов'],
    maxlength: [500, 'Путь к файлу должен быть до 500 символов'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

module.exports = model('Attachment', attachmentSchema);