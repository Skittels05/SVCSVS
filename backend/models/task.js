const { Schema, model } = require('mongoose');

const taskSchema = new Schema({
  _id: {
    type: Number,
    required: true
  },
  backlog_order: { type: Number },
  is_ready: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: [true, 'Заголовок задачи обязателен'],
    minlength: [1, 'Заголовок должен быть от 1 до 200 символов'],
    maxlength: [200, 'Заголовок должен быть от 1 до 200 символов'],
  },
  description: { type: String },
  priority: {
    type: String,
    required: [true, 'Приоритет обязателен'],
    enum: ['low', 'medium', 'high', 'critical'],
  },
  status: {
    type: String,
    required: [true, 'Статус задачи обязателен'],
    enum: ['backlog', 'todo', 'in_progress', 'review', 'done'],
  },
  story_points: {
    type: Number,
    validate: {
      validator: v => Number.isInteger(v) && v >= 1 && v <= 13,
      message: 'Story points должны быть целым числом от 1 до 13',
    },
  },
  due_date: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  project_id: {
    type: Number,
    ref: 'Project',
    required: [true, 'project_id обязателен'],
  },
  iteration_id: {
    type: Number,
    ref: 'Iteration',
  },
  parent_task_id: {
    type: Number,
    ref: 'Task',
  },
  reporter_id: {
    type: Number,
    ref: 'User',
  },
  assignee_id: {
    type: Number,
    ref: 'User',
  },
  attachments: [{
    type: Number,
    ref: 'Attachment'
  }],
}, { _id: false });

// Виртуальные поля
taskSchema.virtual('Project').get(function () {
  return this.project_id;
});
taskSchema.virtual('Iteration').get(function () {
  return this.iteration_id;
});
taskSchema.virtual('Reporter').get(function () {
  return this.reporter_id;
});
taskSchema.virtual('Assignee').get(function () {
  return this.assignee_id;
});
taskSchema.virtual('subTasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'parent_task_id',
});

// Важно: отключаем строгую проверку populate для виртуальных полей
taskSchema.set('strictPopulate', false);

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

taskSchema.pre('save', function () {  // ← без next
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
});

module.exports = model('Task', taskSchema);