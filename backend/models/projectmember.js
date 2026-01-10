const { Schema, model } = require('mongoose');

const projectMemberSchema = new Schema({
  _id: {
    type: Number,
    required: true
  },
  project_id: {
    type: Number,
    ref: 'Project',
    required: [true, 'project_id обязателен'],
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'user_id обязателен'],
  },
  role: {
    type: String,
    required: [true, 'Роль в проекте обязательна'],
    minlength: [1, 'Роль должна быть от 1 до 50 символов'],
    maxlength: [50, 'Роль должна быть от 1 до 50 символов'],
  },
}, { _id: false, timestamps: false });

projectMemberSchema.index({ project_id: 1, user_id: 1 }, { unique: true });

module.exports = model('ProjectMember', projectMemberSchema);