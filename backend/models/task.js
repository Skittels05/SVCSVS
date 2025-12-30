const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    backlog_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_ready: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notNull: { msg: 'Заголовок задачи обязателен' },
        notEmpty: { msg: 'Заголовок не может быть пустым' },
        len: { args: [1, 200], msg: 'Заголовок должен быть от 1 до 200 символов' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notNull: { msg: 'Приоритет обязателен' },
        isIn: { args: [['low', 'medium', 'high', 'critical']], msg: 'Приоритет должен быть low, medium, high или critical' },
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notNull: { msg: 'Статус задачи обязателен' },
        isIn: { args: [['backlog', 'todo', 'in_progress', 'review', 'done']], msg: 'Недопустимый статус задачи' },
      },
    },
    story_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: 'Оценка должна быть целым числом' },
        min: { args: [1], msg: 'Минимальная оценка — 1' },
        max: { args: [13], msg: 'Максимальная оценка — 13' },
      },
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'Tasks',
    timestamps: false,
  });

  Task.addHook('beforeUpdate', (instance) => {
    instance.updated_at = new Date();
  });

  return Task;
};