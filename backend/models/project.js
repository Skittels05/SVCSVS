const { Schema, model } = require('mongoose');

const projectSchema = new Schema({
  _id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Название проекта обязательно'],
    minlength: [1, 'Название должно быть от 1 до 100 символов'],
    maxlength: [100, 'Название должно быть от 1 до 100 символов'],
  },
  description: {
    type: String,
  },
  project_type: {
    type: String,
    required: [true, 'Тип проекта обязателен'],
    enum: { values: ['scrum', 'waterfall'], message: 'Тип проекта должен быть scrum или waterfall' },
  },
  status: {
    type: String,
    required: [true, 'Статус проекта обязателен'],
    enum: { values: ['planned', 'active', 'completed'], message: 'Статус должен быть planned, active или completed' },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

projectSchema.virtual('projectMembers', {
  ref: 'ProjectMember',
  localField: '_id',
  foreignField: 'project_id',
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

projectSchema.pre('save', function () {
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
});

module.exports = model('Project', projectSchema);