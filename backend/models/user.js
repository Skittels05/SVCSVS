const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  _id: {
    type: Number,
    required: true
  },
  full_name: {
    type: String,
    required: [true, 'Полное имя обязательно'],
    minlength: [1, 'Полное имя должно быть от 1 до 100 символов'],
    maxlength: [100, 'Полное имя должно быть от 1 до 100 символов'],
  },
  email: {
    type: String,
    required: [true, 'Email обязателен'],
    unique: true,
    match: [/.+@.+\..+/, 'Некорректный формат email'],
    maxlength: [100, 'Email должен быть до 100 символов'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

module.exports = model('User', userSchema);