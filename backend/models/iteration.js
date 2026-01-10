const { Schema, model } = require('mongoose');

const iterationSchema = new Schema({
  _id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Название итерации обязательно'],
    minlength: [1, 'Название должно быть от 1 до 100 символов'],
    maxlength: [100, 'Название должно быть от 1 до 100 символов'],
  },
  type: {
    type: String,
    required: [true, 'Тип итерации обязателен'],
    enum: { values: ['sprint', 'phase'], message: 'Тип должен быть sprint или phase' },
  },
  start_date: { type: Date },
  end_date: {
    type: Date,
    validate: {
      validator: function(value) {
        if (value && this.start_date) {
          return new Date(value) >= new Date(this.start_date);
        }
        return true;
      },
      message: 'Дата окончания не может быть раньше даты начала',
    },
  },
  status: {
    type: String,
    required: [true, 'Статус итерации обязателен'],
    enum: { values: ['planned', 'active', 'completed'], message: 'Статус должен быть planned, active или completed' },
  },
  project_id: {
    type: Number,
    ref: 'Project',
    required: [true, 'project_id обязателен'],
  },
}, { _id: false });

module.exports = model('Iteration', iterationSchema);